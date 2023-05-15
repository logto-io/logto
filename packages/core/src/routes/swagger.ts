import { conditionalArray, deduplicate, toTitle } from '@silverhand/essentials';
import type { IMiddleware } from 'koa-router';
import type Router from 'koa-router';
import type { OpenAPIV3 } from 'openapi-types';
import { ZodObject, ZodOptional } from 'zod';

import { isKoaAuthMiddleware } from '#src/middleware/koa-auth/index.js';
import type { WithGuardConfig } from '#src/middleware/koa-guard.js';
import { isGuardMiddleware } from '#src/middleware/koa-guard.js';
import { fallbackDefaultPageSize, isPaginationMiddleware } from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';
import { codeToMessage } from '#src/utils/http.js';
import { translationSchemas, zodTypeToSwagger } from '#src/utils/zod.js';

import type { AnonymousRouter } from './types.js';

type RouteObject = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operation: OpenAPIV3.OperationObject;
};

type MethodMap = {
  [key in OpenAPIV3.HttpMethods]?: OpenAPIV3.OperationObject;
};

export const paginationParameters: OpenAPIV3.ParameterObject[] = [
  {
    name: 'page',
    in: 'query',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1,
    },
  },
  {
    name: 'page_size',
    in: 'query',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      default: fallbackDefaultPageSize,
    },
  },
];

// Parameter serialization: https://swagger.io/docs/specification/serialization
const buildParameters = (
  zodParameters: unknown,
  inWhere: 'path' | 'query'
): OpenAPIV3.ParameterObject[] => {
  if (!zodParameters) {
    return [];
  }

  assertThat(zodParameters instanceof ZodObject, 'swagger.not_supported_zod_type_for_params');

  // Type from Zod is any
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.entries(zodParameters.shape).map(([key, value]) => ({
    name: key,
    in: inWhere,
    required: !(value instanceof ZodOptional),
    schema: zodTypeToSwagger(value),
  }));
};

const buildTag = (path: string) => {
  const root = path.split('/')[1];

  if (root?.startsWith('.')) {
    return root;
  }

  return toTitle(root ?? 'General');
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
  const pathParameters = buildParameters(params, 'path');

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
      const description = codeToMessage[status];

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
          .flatMap<RouteObject>(({ path: routerPath, stack, methods, name }) =>
            methods
              .map((method) => method.toLowerCase())
              // There is no need to show the HEAD method.
              .filter((method): method is OpenAPIV3.HttpMethods => method !== 'head')
              .map((httpMethod) => {
                const path = `/api${routerPath}`;

                return {
                  path,
                  method: httpMethod,
                  operation: buildOperation(stack, routerPath, isAuthGuarded),
                };
              })
          )
      );
    });

    const pathMap = new Map<string, MethodMap>();

    // Group routes by path
    for (const { path, method, operation } of routes) {
      pathMap.set(path, { ...pathMap.get(path), [method]: operation });
    }

    const document: OpenAPIV3.Document = {
      openapi: '3.0.1',
      info: {
        title: 'Logto Core',
        version: '0.1.0',
      },
      paths: Object.fromEntries(pathMap),
      components: { schemas: translationSchemas },
    };

    ctx.body = document;

    return next();
  });
}
