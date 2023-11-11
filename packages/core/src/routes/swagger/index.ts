import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { httpCodeToMessage } from '@logto/core-kit';
import { conditionalArray, deduplicate } from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import type { IMiddleware } from 'koa-router';
import type Router from 'koa-router';
import type { OpenAPIV3 } from 'openapi-types';

import { isKoaAuthMiddleware } from '#src/middleware/koa-auth/index.js';
import type { WithGuardConfig } from '#src/middleware/koa-guard.js';
import { isGuardMiddleware } from '#src/middleware/koa-guard.js';
import { isPaginationMiddleware } from '#src/middleware/koa-pagination.js';
import { translationSchemas, zodTypeToSwagger } from '#src/utils/zod.js';

import type { AnonymousRouter } from '../types.js';

import { buildTag, findSupplementFiles, normalizePath } from './utils/general.js';
import {
  type ParameterArray,
  buildParameters,
  paginationParameters,
  buildPathIdParameters,
  mergeParameters,
} from './utils/parameters.js';

type RouteObject = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operation: OpenAPIV3.OperationObject;
  /** Path parameters for the operation. E.g. `/users/:id` has a path parameter `id`. */
  pathParameters: ParameterArray;
};

const buildOperation = (
  stack: IMiddleware[],
  path: string,
  isAuthGuarded: boolean
): OpenAPIV3.OperationObject & { pathParameters: ParameterArray } => {
  const guard = stack.find((function_): function_ is WithGuardConfig<IMiddleware> =>
    isGuardMiddleware(function_)
  );
  const { params, query, body, response, status } = guard?.config ?? {};
  const pathParameters = buildParameters(params, 'path', path);

  const hasPagination = stack.some((function_) => isPaginationMiddleware(function_));
  const queryParameters = [
    ...buildParameters(query, 'query'),
    ...(hasPagination ? paginationParameters : []),
  ];

  const requestBody = body && {
    required: true,
    content: {
      'application/json': {
        schema: zodTypeToSwagger(body),
      },
    },
  };

  const hasInputGuard = Boolean(params ?? query ?? body);
  const responses: OpenAPIV3.ResponsesObject = Object.fromEntries(
    deduplicate(
      conditionalArray(status ?? 200, hasInputGuard && 400, isAuthGuarded && [401, 403])
    ).map<[number, OpenAPIV3.ResponseObject]>((status) => {
      const description = httpCodeToMessage[status];

      if (!description) {
        throw new Error(`Invalid status code ${status}.`);
      }

      if (status === 200) {
        return [
          status,
          {
            description,
            content: {
              'application/json': {
                schema: response && zodTypeToSwagger(response),
              },
            },
          },
        ];
      }

      return [status, { description }];
    })
  );

  return {
    tags: [buildTag(path)],
    parameters: queryParameters,
    pathParameters,
    requestBody,
    responses,
  };
};

const isManagementApiRouter = ({ stack }: Router) =>
  stack
    .filter(({ path }) => !path.includes('.*'))
    .some(({ stack }) => stack.some((function_) => isKoaAuthMiddleware(function_)));

// Add more components here to cover more ID parameters in paths. For example, if there is a
// path `/foo/:barBazId`, then add `bar-baz` to the array.
const identifiableEntityNames = [
  'application',
  'connector',
  'resource',
  'user',
  'log',
  'role',
  'scope',
  'hook',
  'domain',
];

/**
 * Attach the `/swagger.json` route which returns the generated OpenAPI document for the
 * management APIs.
 *
 * @param router The router to attach the route to.
 * @param allRouters All management API routers. This is used to generate the OpenAPI document.
 */
// Keep using `any` to accept various custom context types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function swaggerRoutes<T extends AnonymousRouter, R extends Router<unknown, any>>(
  router: T,
  allRouters: R[]
) {
  router.get('/swagger.json', async (ctx, next) => {
    const routes = allRouters.flatMap<RouteObject>((router) => {
      const isAuthGuarded = isManagementApiRouter(router);

      return (
        router.stack
          // Filter out universal routes (mostly like a proxy route to withtyped)
          .filter(({ path }) => !path.includes('.*'))
          .flatMap<RouteObject>(({ path: routerPath, stack, methods }) =>
            methods
              .map((method) => method.toLowerCase())
              // There is no need to show the HEAD method.
              .filter((method): method is OpenAPIV3.HttpMethods => method !== 'head')
              .map((httpMethod) => {
                const path = normalizePath(routerPath);
                const { pathParameters, ...operation } = buildOperation(
                  stack,
                  routerPath,
                  isAuthGuarded
                );

                return {
                  path,
                  method: httpMethod,
                  pathParameters,
                  operation,
                };
              })
          )
      );
    });

    const pathMap = new Map<string, OpenAPIV3.PathItemObject>();

    // Group routes by path
    for (const { path, method, operation, pathParameters } of routes) {
      // Use the first path parameters record as the shared definition for the path to avoid
      // duplication.
      if (!pathMap.has(path)) {
        pathMap.set(path, { parameters: pathParameters });
      }

      pathMap.set(path, { ...pathMap.get(path), [method]: operation });
    }

    // Current path should be the root directory of routes files.
    const supplementPaths = await findSupplementFiles(path.dirname(fileURLToPath(import.meta.url)));
    const supplementDocuments = await Promise.all(
      supplementPaths.map(
        // eslint-disable-next-line no-restricted-syntax
        async (path) => JSON.parse(await fs.readFile(path, 'utf8')) as Record<string, unknown>
      )
    );

    const baseDocument: OpenAPIV3.Document = {
      openapi: '3.0.1',
      info: {
        title: 'Logto Core',
        description: 'Management APIs for Logto core service.',
        version: 'Cloud',
      },
      paths: Object.fromEntries(pathMap),
      components: {
        schemas: translationSchemas,
        parameters: identifiableEntityNames.reduce(
          (previous, entityName) => ({ ...previous, ...buildPathIdParameters(entityName) }),
          {}
        ),
      },
    };

    ctx.body = supplementDocuments.reduce(
      (document, supplement) => deepmerge(document, supplement, { arrayMerge: mergeParameters }),
      baseDocument
    );

    return next();
  });
}
