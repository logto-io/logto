import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { AnonymousRouter, AuthedRouter } from '@/routes/types';

import swaggerRoutes from './swagger';

describe('swagger api', () => {
  const authedRouter: AuthedRouter = new Router();
  authedRouter.get('/mock', () => ({}));

  const anonymousRouter: AnonymousRouter = new Router();
  swaggerRoutes(anonymousRouter, [authedRouter]);

  const app = new Koa();
  app.use(anonymousRouter.routes()).use(anonymousRouter.allowedMethods());

  const swaggerRequest = request(app.callback());

  describe('GET /swagger.json', () => {
    it('should contain standard fields', async () => {
      const response = await swaggerRequest.get('/swagger.json');
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject(
        expect.objectContaining({
          /* eslint-disable @typescript-eslint/no-unsafe-assignment */
          openapi: expect.any(String),
          info: expect.objectContaining({
            title: expect.any(String),
            version: expect.any(String),
          }),
          paths: expect.any(Object),
          /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        })
      );
    });

    it('should contain specific paths', async () => {
      const response = await swaggerRequest.get('/swagger.json');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { paths } = response.body;

      expect(Object.entries(paths)).toHaveLength(2);
      expect(paths).toMatchObject(
        expect.objectContaining({
          /* eslint-disable @typescript-eslint/no-unsafe-assignment */
          '/api/mock': expect.objectContaining({
            head: expect.anything(),
            get: expect.anything(),
          }),
          '/api/swagger.json': expect.objectContaining({
            head: expect.anything(),
            get: expect.anything(),
          }),
          /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        })
      );
    });
  });
});
