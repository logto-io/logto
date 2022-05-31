import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { AnonymousRouter, AuthedRouter } from '@/routes/types';

import swaggerRoutes from './swagger';

describe('swagger api', () => {
  const anonymousRouter: AnonymousRouter = new Router();
  const anotherRouter: AuthedRouter = new Router();
  swaggerRoutes(anonymousRouter, [anotherRouter]);

  const app = new Koa();
  app.use(anonymousRouter.routes()).use(anonymousRouter.allowedMethods());

  const swaggerRequest = request(app.callback());

  it('GET /swagger.json', async () => {
    const response = await swaggerRequest.get('/swagger.json');
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('openapi');
    expect(response.body).toHaveProperty('info');

    // TODO: find a better way to test the paths details should contain api list
    expect(response.body).toHaveProperty('paths');
  });
});
