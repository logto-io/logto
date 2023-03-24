import { createMockUtils } from '@logto/shared/esm';
import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';
import { number, object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type { AnonymousRouter } from '#src/routes/types.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const { load } = mockEsm('js-yaml', () => ({
  load: jest.fn().mockReturnValue({ paths: {} }),
}));

const {
  default: swaggerRoutes,
  defaultResponses,
  paginationParameters,
} = await import('./swagger.js');

export const createSwaggerRequest = (
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(Object.entries(response.body.paths)).toHaveLength(2);
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
    const swaggerRequest = createSwaggerRequest([testTagRouter]);

    const response = await swaggerRequest.get('/swagger.json');
    expect(response.body.paths).toMatchObject({
      '/api/mock': {
        get: { tags: ['Mock'] },
      },
      '/api/.well-known': {
        put: { tags: ['.well-known'] },
      },
    });
  });

  it('should parse the path parameters', async () => {
    const queryParametersRouter = new Router();
    queryParametersRouter.get(
      '/mock/:id/:field',
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
      '/api/mock/:id/:field': {
        get: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'number' },
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

  describe('should use correct responses', () => {
    it('should use "defaultResponses" if there is no custom "responses" from the additional swagger', async () => {
      load.mockReturnValueOnce({
        paths: { '/api/mock': { delete: {} } },
      });

      const swaggerRequest = createSwaggerRequest([mockRouter]);
      const response = await swaggerRequest.get('/swagger.json');
      expect(response.body.paths).toMatchObject({
        '/api/mock': {
          delete: { responses: defaultResponses },
        },
      });
    });

    it('should use custom "responses" from the additional swagger if it exists', async () => {
      load.mockReturnValueOnce({
        paths: {
          '/api/mock': {
            get: {
              responses: {
                '204': { description: 'No Content' },
              },
            },
            patch: {
              responses: {
                '202': { description: 'Accepted' },
              },
            },
          },
        },
      });

      const swaggerRequest = createSwaggerRequest([mockRouter]);
      const response = await swaggerRequest.get('/swagger.json');
      expect(response.body.paths).toMatchObject({
        '/api/mock': {
          get: {
            responses: {
              '204': { description: 'No Content' },
            },
          },
          patch: {
            responses: {
              '202': { description: 'Accepted' },
            },
          },
        },
      });
    });
  });
});
