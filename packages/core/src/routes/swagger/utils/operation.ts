import { httpCodeToMessage } from '@logto/core-kit';
import { deduplicate, conditionalArray, cond } from '@silverhand/essentials';
import type Router from 'koa-router';
import { type IMiddleware } from 'koa-router';
import { type OpenAPIV3 } from 'openapi-types';

import { type WithGuardConfig, isGuardMiddleware } from '#src/middleware/koa-guard.js';
import { isPaginationMiddleware } from '#src/middleware/koa-pagination.js';
import { zodTypeToSwagger } from '#src/utils/zod.js';

import { buildTag, isManagementApiRouter, normalizePath } from './general.js';
import { buildOperationId, customRoutes, throwByDifference } from './operation-id.js';
import { buildParameters, paginationParameters, searchParameters } from './parameters.js';

const anonymousPaths = new Set<string>([
  'interaction',
  '.well-known',
  'authn',
  'swagger.json',
  'status',
  'experience',
]);

const advancedSearchPaths = new Set<string>([
  '/applications',
  '/applications/:applicationId/roles',
  '/resources/:resourceId/scopes',
  '/roles/:id/applications',
  '/roles/:id/scopes',
  '/roles',
  '/roles/:id/users',
  '/users',
  '/users/:userId/roles',
]);

// eslint-disable-next-line complexity
const buildOperation = (
  method: OpenAPIV3.HttpMethods,
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
    ...(advancedSearchPaths.has(path) && method === 'get' ? [searchParameters] : []),
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

      if (status === 200 || status === 201) {
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

  const [firstSegment] = path.split('/').slice(1);

  return {
    operationId: buildOperationId(method, path),
    tags: [buildTag(path)],
    parameters: [...pathParameters, ...queryParameters],
    requestBody,
    responses,
    security: cond(firstSegment && anonymousPaths.has(firstSegment) && []),
  };
};

type RouteObject = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operation: OpenAPIV3.OperationObject;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnknownRouter = Router<unknown, any>;

type Options = {
  guardCustomRoutes?: boolean;
};

export const buildRouterObjects = <T extends UnknownRouter>(routers: T[], options?: Options) => {
  /**
   * A set to store all custom routes that have been built.
   * @see {@link customRoutes}
   */
  const builtCustomRoutes = new Set<string>();

  const routes = routers.flatMap<RouteObject>((router) => {
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
              const operation = buildOperation(httpMethod, stack, routerPath, isAuthGuarded);

              if (options?.guardCustomRoutes && customRoutes[`${httpMethod} ${routerPath}`]) {
                builtCustomRoutes.add(`${httpMethod} ${routerPath}`);
              }

              return {
                path,
                method: httpMethod,
                operation,
              };
            })
        )
    );
  });

  // Ensure all custom routes are built.
  if (options?.guardCustomRoutes) {
    throwByDifference(builtCustomRoutes);
  }

  return routes;
};

export const groupRoutesByPath = (routes: RouteObject[]) => {
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

  return { pathMap, tags };
};
