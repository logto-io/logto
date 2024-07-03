import Koa from 'koa';
import Router from 'koa-router';
import { type OpenAPIV3 } from 'openapi-types';
import request from 'supertest';
import { number, object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type { AnonymousRouter } from '#src/routes/types.js';

const { default: swaggerRoutes } = await import('./index.js');
const { paginationParameters } = await import('./utils/parameters.js');

const createSwaggerRequest = (
  allRouters: Router[],
  swaggerRouter: AnonymousRouter = new Router()
) => {
  swaggerRoutes(swaggerRouter, allRouters);
  const app = new Koa();
  app.use(swaggerRouter.routes()).use(swaggerRouter.allowedMethods());

  return request(app.callback());
};

describe('GET /swagger.json', () => {
  const mockRouter = new Router();
  mockRouter.get('/mock', () => ({}));
  mockRouter.patch('/mock', () => ({}));
  mockRouter.post('/mock', () => ({}));
  mockRouter.delete('/mock', () => ({}));

  const testRouter = new Router();
  testRouter.options('/test', () => ({}));
  testRouter.put('/test', () => ({}));

  const mockSwaggerRequest = createSwaggerRequest([mockRouter, testRouter]);

  it('should contain the standard fields', async () => {
    const response = await mockSwaggerRequest.get('/swagger.json');
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      openapi: expect.any(String),
      info: {
        title: expect.any(String),
        version: expect.any(String),
      },
      paths: expect.any(Object),
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });
  });

  it('should contain the specific paths', async () => {
    const response = await mockSwaggerRequest.get('/swagger.json');
    expect(response.body.paths).toMatchObject({
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      '/api/mock': {
        get: expect.anything(),
        patch: expect.anything(),
        post: expect.anything(),
        delete: expect.anything(),
      },
      '/api/test': {
        options: expect.anything(),
        put: expect.anything(),
      },
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });
  });

  it('should generate the tags', async () => {
    const testTagRouter = new Router();
    testTagRouter.get('/mock', () => ({}));
    testTagRouter.put('/.well-known', () => ({}));
    testTagRouter.put('/sso-connectors', () => ({}));
    const swaggerRequest = createSwaggerRequest([testTagRouter]);

    const response = await swaggerRequest.get('/swagger.json');
    expect(response.body.paths).toMatchObject({
      '/api/mock': {
        get: { tags: ['Mock'] },
      },
      '/api/.well-known': {
        put: { tags: ['Well-known'] },
      },
      '/api/sso-connectors': {
        put: { tags: ['SSO connectors'] },
      },
    });
  });

  it('should parse the path parameters', async () => {
    const queryParametersRouter = new Router();
    queryParametersRouter.get(
      '/mock/:id/fields/:field',
      koaGuard({
        params: object({
          id: number(),
          field: string(),
        }),
      }),
      () => ({})
    );
    // Test plural
    queryParametersRouter.get(
      '/mocks/:id/fields/:field',
      koaGuard({
        params: object({
          id: number(),
          field: string(),
        }),
      }),
      () => ({})
    );
    const swaggerRequest = createSwaggerRequest([queryParametersRouter]);

    const response = await swaggerRequest.get('/swagger.json');
    expect(response.body.paths).toMatchObject({
      '/api/mock/{id}/fields/{field}': {
        get: {
          parameters: [
            {
              $ref: '#/components/parameters/mockId-root',
            },
            {
              name: 'field',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
        },
      },
      '/api/mocks/{id}/fields/{field}': {
        get: {
          parameters: [
            {
              $ref: '#/components/parameters/mockId-root',
            },
            {
              name: 'field',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
        },
      },
    });
  });

  it('should be able to find supplement files and merge them', async () => {
    const swaggerRequest = createSwaggerRequest([mockRouter]);
    const response = await swaggerRequest.get('/swagger.json');
    // Partially match one of the supplement files `status.openapi.json`. Should update this test
    // when the file is updated.
    expect(response.body).toMatchObject({
      paths: {
        '/api/status': {
          get: {
            summary: 'Health check',
            responses: {
              '204': {
                description: 'The Logto core service is healthy.',
              },
            },
          },
        },
      },
    });
  });

  describe('parse query parameters', () => {
    it('should parse the normal query parameters', async () => {
      const queryParametersRouter = new Router();
      queryParametersRouter.get(
        '/mock',
        koaGuard({
          query: object({
            id: number(),
            name: string().optional(),
          }),
        }),
        () => ({})
      );
      const swaggerRequest = createSwaggerRequest([queryParametersRouter]);
      const response = await swaggerRequest.get('/swagger.json');
      expect(response.body.paths).toMatchObject({
        '/api/mock': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'query',
                required: true,
                schema: {
                  type: 'number',
                },
              },
              {
                name: 'name',
                in: 'query',
                required: false,
                schema: {
                  type: 'string',
                },
              },
            ],
          },
        },
      });
    });

    it('should append page and page_size to the query parameters when the route uses pagination', async () => {
      const queryParametersRouter = new Router();
      queryParametersRouter.get('/mock', koaPagination(), () => ({}));
      const swaggerRequest = createSwaggerRequest([queryParametersRouter]);
      const response = await swaggerRequest.get('/swagger.json');
      expect(response.body.paths).toMatchObject({
        '/api/mock': {
          get: {
            parameters: paginationParameters,
          },
        },
      });
    });
  });

  it('should parse the request body', async () => {
    const queryParametersRouter = new Router();
    queryParametersRouter.post(
      '/mock',
      koaGuard({
        body: object({
          name: string(),
        }),
      }),
      () => ({})
    );
    const swaggerRequest = createSwaggerRequest([queryParametersRouter]);
    const response = await swaggerRequest.get('/swagger.json');
    expect(response.body.paths).toMatchObject({
      '/api/mock': {
        post: {
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  it('should fall back to default when no response guard found', async () => {
    const swaggerRequest = createSwaggerRequest([mockRouter]);
    const response = await swaggerRequest.get('/swagger.json');
    expect(response.body.paths).toMatchObject({
      '/api/mock': {
        delete: {
          responses: {
            200: { description: 'OK', content: { 'application/json': {} } },
          } satisfies OpenAPIV3.ResponsesObject,
        },
      },
    });
  });
});
