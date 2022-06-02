import { toTitle } from '@silverhand/essentials';
import Router, { IMiddleware } from 'koa-router';
import { OpenAPIV3 } from 'openapi-types';

import { isGuardMiddleware, WithGuardConfig } from '@/middleware/koa-guard';
import { zodTypeToSwagger } from '@/utils/zod';

import { AnonymousRouter } from './types';

type HttpMethod = 'get' | 'head' | 'patch' | 'post' | 'delete';

type RouteObject = {
  path: string;
  method: HttpMethod;
  operationObject: OpenAPIV3.OperationObject;
};

type MethodsObject = Partial<Record<HttpMethod, OpenAPIV3.OperationObject>>;

type PathsObject = Record<string, MethodsObject>;

const buildOperationObject = (stack: IMiddleware[], path: string): OpenAPIV3.OperationObject => {
  const guard = stack.find((function_): function_ is WithGuardConfig<IMiddleware> =>
    isGuardMiddleware(function_)
  );
  const body = guard?.config.body;

  return {
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
  };
};

export default function swaggerRoutes<T extends AnonymousRouter, R extends Router<unknown, any>>(
  router: T,
  allRouters: R[]
) {
  router.get('/swagger.json', async (ctx, next) => {
    const routes = allRouters.flatMap<RouteObject>((router) =>
      router.stack.flatMap<RouteObject>(({ path, stack, methods }) =>
        methods
          // There is no need to show the HEAD method.
          .filter((method) => method !== 'HEAD')
          .map((method) => ({
            path: `/api${path}`,
            method: method.toLowerCase() as HttpMethod,
            operationObject: buildOperationObject(stack, path),
          }))
      )
    );

    // Group routes by path
    // eslint-disable-next-line unicorn/prefer-object-from-entries
    const paths = routes.reduce<PathsObject>(
      (pathsObject, { path, method, operationObject }: RouteObject) => {
        const methodObject = pathsObject[path];

        /* eslint-disable @silverhand/fp/no-mutation */
        if (methodObject) {
          methodObject[method] = operationObject;
        } else {
          pathsObject[path] = { [method]: operationObject };
        }
        /* eslint-enable @silverhand/fp/no-mutation */

        return pathsObject;
      },
      Object.create(null)
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
