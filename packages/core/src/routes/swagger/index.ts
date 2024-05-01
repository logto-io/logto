import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { httpCodeToMessage } from '@logto/core-kit';
import { condString, conditionalArray, deduplicate } from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import { findUp } from 'find-up';
import type { IMiddleware } from 'koa-router';
import type Router from 'koa-router';
import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import { isKoaAuthMiddleware } from '#src/middleware/koa-auth/index.js';
import type { WithGuardConfig } from '#src/middleware/koa-guard.js';
import { isGuardMiddleware } from '#src/middleware/koa-guard.js';
import { isPaginationMiddleware } from '#src/middleware/koa-pagination.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { translationSchemas, zodTypeToSwagger } from '#src/utils/zod.js';

import type { AnonymousRouter } from '../types.js';

import {
  buildTag,
  findSupplementFiles,
  normalizePath,
  removeCloudOnlyOperations,
  validateSupplement,
  validateSwaggerDocument,
} from './utils/general.js';
import {
  buildParameters,
  paginationParameters,
  buildPathIdParameters,
  mergeParameters,
} from './utils/parameters.js';

type RouteObject = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operation: OpenAPIV3.OperationObject;
};

const buildOperation = (
  stack: IMiddleware[],
  path: string,
  isAuthGuarded: boolean
): OpenAPIV3.OperationObject => {
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
    parameters: [...pathParameters, ...queryParameters],
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
  'key',
  'connector-factory',
  'factory',
  'application',
  'connector',
  'sso-connector',
  'resource',
  'user',
  'log',
  'role',
  'scope',
  'hook',
  'domain',
  'verification',
  'organization',
  'organization-role',
  'organization-scope',
  'organization-invitation',
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
                const operation = buildOperation(stack, routerPath, isAuthGuarded);

                return {
                  path,
                  method: httpMethod,
                  operation,
                };
              })
          )
      );
    });

    const pathMap = new Map<string, OpenAPIV3.PathItemObject>();
    const tags = new Set<string>();

    // Group routes by path
    for (const { path, method, operation } of routes) {
      if (operation.tags) {
        // Collect all tags for sorting
        for (const tag of operation.tags) {
          tags.add(tag);
        }
      }
      pathMap.set(path, { ...pathMap.get(path), [method]: operation });
    }

    const routesDirectory = await findUp('routes', {
      type: 'directory',
      cwd: fileURLToPath(import.meta.url),
    });
    assertThat(routesDirectory, new Error('Cannot find routes directory.'));

    const supplementPaths = await findSupplementFiles(routesDirectory);
    const supplementDocuments = await Promise.all(
      supplementPaths.map(async (path) =>
        removeCloudOnlyOperations(
          // eslint-disable-next-line no-restricted-syntax -- trust the type here as we'll validate it later
          JSON.parse(await fs.readFile(path, 'utf8')) as DeepPartial<OpenAPIV3.Document>
        )
      )
    );

    const baseDocument: OpenAPIV3.Document = {
      openapi: '3.0.1',
      servers: [
        {
          url: EnvSet.values.isCloud ? 'https://[tenant_id].logto.app/' : ctx.request.origin,
          description: 'Logto endpoint address.',
        },
      ],
      info: {
        title: 'Logto API references',
        description:
          'API references for Logto services. To learn more about how to interact with Logto APIs, see [Interact with Management API](https://docs.logto.io/docs/recipes/interact-with-management-api/).' +
          condString(
            EnvSet.values.isCloud &&
              '\n\nNote: The documentation is for Logto Cloud. If you are using Logto OSS, please refer to the response of `/api/swagger.json` endpoint on your Logto instance.'
          ),
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
      tags: [...tags].map((tag) => ({ name: tag })),
    };

    const data = supplementDocuments.reduce<OpenAPIV3.Document>(
      (document, supplement) =>
        deepmerge<OpenAPIV3.Document, DeepPartial<OpenAPIV3.Document>>(document, supplement, {
          arrayMerge: mergeParameters,
        }),
      baseDocument
    );

    if (EnvSet.values.isUnitTest) {
      getConsoleLogFromContext(ctx).warn('Skip validating swagger document in unit test.');
    }
    // Don't throw for integrity check in production as it has no benefit.
    else if (!EnvSet.values.isProduction || EnvSet.values.isIntegrationTest) {
      for (const document of supplementDocuments) {
        validateSupplement(baseDocument, document);
      }
      validateSwaggerDocument(data);
    }

    ctx.body = {
      ...data,
      tags: data.tags?.slice().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name)),
    };

    return next();
  });
}
