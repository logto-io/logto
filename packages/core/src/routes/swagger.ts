import { toTitle } from '@silverhand/essentials';
import Router, { IMiddleware } from 'koa-router';
import { OpenAPIV3 } from 'openapi-types';

import { isGuardMiddleware, WithGuardConfig } from '@/middleware/koa-guard';
import { zodTypeToSwagger } from '@/utils/zod';

import { AnonymousRouter } from './types';

type Guard = WithGuardConfig<IMiddleware> | undefined;

type Route = { path: string; method: string; guard: Guard };

export default function swaggerRoutes<T extends AnonymousRouter, R extends Router<unknown, any>>(
  router: T,
  allRouters: R[]
) {
  router.get('/swagger.json', async (ctx, next) => {
    const routes = allRouters.flatMap((router) =>
      router.stack.flatMap(({ path, stack, methods }) => {
        const guard = stack.find((function_): function_ is WithGuardConfig<IMiddleware> =>
          isGuardMiddleware(function_)
        );

        return (
          methods
            // There is no need to show the HEAD method.
            .filter((method) => method !== 'HEAD')
            .map((method) => ({ path, method, guard }))
        );
      })
    );

    // Group routes by path
    const uniquePaths = Array.from(
      routes
        .reduce<Map<string, Map<string, Guard>>>((map, { path, method, guard }: Route) => {
          // eslint-disable-next-line @silverhand/fp/no-let
          let methodMap = map.get(path);

          if (!methodMap) {
            // eslint-disable-next-line @silverhand/fp/no-mutation
            methodMap = new Map();
            map.set(path, methodMap);
          }

          methodMap.set(method, guard);

          return map;
        }, new Map())
        .entries()
    );

    const paths = Object.fromEntries(
      uniquePaths.map<[string, OpenAPIV3.PathItemObject]>(([path, methodMap]) => [
        `/api${path}`,
        Object.fromEntries(
          Array.from<[string, Guard]>(methodMap.entries()).map<[string, OpenAPIV3.OperationObject]>(
            ([method, guard]) => {
              const body = guard?.config.body;

              return [
                method.toLowerCase(),
                {
                  tags: [toTitle(path.split('/')[1] ?? 'General')],
                  requestBody: body && {
                    required: true,
                    content: {
                      'application/json': {
                        schema: zodTypeToSwagger(body),
                      },
                    },
                  },
                  responses: {
                    '200': {
                      description: 'OK',
                    },
                  },
                },
              ];
            }
          )
        ),
      ])
    );

    const document: OpenAPIV3.Document = {
      openapi: '3.0.1',
      info: {
        title: 'Logto Core',
        version: '0.1.0',
      },
      paths,
    };

    ctx.body = document;

    return next();
  });
}
