import { toTitle } from '@silverhand/essentials';
import Router, { IMiddleware } from 'koa-router';
import { OpenAPIV3 } from 'openapi-types';

import { isGuardMiddleware, WithGuardConfig } from '@/middleware/koa-guard';
import { zodTypeToSwagger } from '@/utils/zod';

import { AnonymousRouter } from './types';

type RouteObject = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operation: OpenAPIV3.OperationObject;
};

type MethodMap = {
  [key in OpenAPIV3.HttpMethods]?: OpenAPIV3.OperationObject;
};

const buildOperation = (stack: IMiddleware[], path: string): OpenAPIV3.OperationObject => {
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
            method: method.toLowerCase() as OpenAPIV3.HttpMethods,
            operation: buildOperation(stack, path),
          }))
      )
    );

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
    };

    ctx.body = document;

    return next();
  });
}
