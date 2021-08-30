import Router, { IMiddleware } from 'koa-router';
import { OpenAPIV3 } from 'openapi-types';

import { isGuardMiddleware, WithGuardConfig } from '@/middleware/koa-guard';
import { toTitle } from '@/utils/string';
import { zodTypeToSwagger } from '@/utils/zod';

export default function swaggerRoutes(router: Router) {
  router.get('/swagger.json', async (ctx, next) => {
    const routes = ctx.router.stack.map(({ path, stack, methods }) => {
      const guard = stack.find((function_): function_ is WithGuardConfig<IMiddleware> =>
        isGuardMiddleware(function_)
      );
      return { path, methods, guard };
    });

    const paths = Object.fromEntries(
      routes.map<[string, OpenAPIV3.PathItemObject]>(({ path, methods, guard }) => {
        const body = guard?.config.body;

        return [
          `/api${path}`,
          Object.fromEntries(
            methods.map<[string, OpenAPIV3.OperationObject]>((method) => [
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
            ])
          ),
        ];
      })
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
