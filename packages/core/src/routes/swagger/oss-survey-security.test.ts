import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';
import { object, string } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { AnonymousRouter } from '#src/routes/types.js';

const { default: swaggerRoutes } = await import('./index.js');

const authMiddleware = async (_ctx: unknown, next: () => Promise<unknown>) => next();

describe('OSS survey swagger security', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const setDevFeaturesEnabled = (enabled: boolean) => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', enabled);
  };

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('keeps OSS survey route protected by OAuth2 in generated swagger', async () => {
    setDevFeaturesEnabled(true);

    const managementRouter = new Router();
    managementRouter.use(authMiddleware);
    managementRouter.post(
      '/oss-survey/report',
      koaGuard({
        body: object({
          emailAddress: string().email(),
          project: string(),
        }),
        status: 204,
      }),
      () => ({})
    );

    const swaggerRouter = new Router() as AnonymousRouter;
    swaggerRoutes(swaggerRouter, [managementRouter]);

    const app = new Koa();
    app.use(swaggerRouter.routes()).use(swaggerRouter.allowedMethods());

    const response = await request(app.callback()).get('/swagger.json');

    expect(response.status).toBe(200);
    expect(response.body.security).toEqual([{ OAuth2: ['all'] }]);
    expect(response.body.paths['/api/oss-survey/report']?.post?.security).toBeUndefined();
    expect(response.body.paths['/api/oss-survey/report']?.post?.responses).toMatchObject({
      '204': {
        description: 'Survey submission accepted for relay.',
      },
      '400': {
        description: 'Bad request. The payload is invalid.',
      },
      '401': {
        description: 'Unauthorized',
      },
      '403': {
        description: 'Forbidden',
      },
    });
  });
});
