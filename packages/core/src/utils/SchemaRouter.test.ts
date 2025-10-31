import { type GeneratedSchema } from '@logto/schemas';
import type { Middleware } from 'koa';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';

import SchemaQueries from './SchemaQueries.js';
import SchemaRouter from './SchemaRouter.js';
import { createRequester, createTestPool } from './test-utils.js';

const { jest } = import.meta;

type CreateSchema = {
  id: string;
  name?: string;
};

type Schema = {
  id: string;
  name: string;
};

describe('SchemaRouter', () => {
  const schema: GeneratedSchema<'id' | 'name', CreateSchema, Schema> = {
    table: 'test_tables',
    tableSingular: 'test_table',
    fields: {
      id: 'id',
      name: 'name',
    },
    fieldKeys: ['id', 'name'],
    createGuard: z.object({ id: z.string(), name: z.string().optional() }),
    guard: z.object({ id: z.string(), name: z.string() }),
    updateGuard: z.object({ id: z.string(), name: z.string() }).partial(),
  };
  const entities = [
    { id: '1', name: 'test' },
    { id: '2', name: 'test2' },
  ] as const satisfies readonly Schema[];
  const queries = new SchemaQueries(createTestPool(undefined, { id: '1' }), schema);

  jest.spyOn(queries, 'findAll').mockResolvedValue([entities.length, entities]);
  jest.spyOn(queries, 'findById').mockImplementation(async (id) => {
    const entity = entities.find((entity) => entity.id === id);
    if (!entity) {
      throw new RequestError({ code: 'entity.not_found', status: 404 });
    }
    return entity;
  });
  jest.spyOn(queries, 'insert').mockResolvedValue({ id: 'new', name: 'test_new' });
  jest.spyOn(queries, 'updateById').mockImplementation(async (id, data) => ({
    id,
    name: 'name_patch_default',
    ...data,
  }));
  jest.spyOn(queries, 'deleteById');

  const schemaRouter = new SchemaRouter(schema, queries);
  const request = createRequester({ authedRoutes: (router) => router.use(schemaRouter.routes()) });
  const baseRoute = `/${schema.table.replaceAll('_', '-')}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should be able to get all entities', async () => {
      const response = await request.get(baseRoute);

      expect(queries.findAll).toHaveBeenCalledWith(20, 0, undefined);
      expect(response.body).toStrictEqual(entities);
    });

    it('should be able to get all entities with pagination', async () => {
      const response = await request.get(`${baseRoute}?page=1&page_size=10`);

      expect(queries.findAll).toHaveBeenCalledWith(10, 0, undefined);
      expect(response.body).toStrictEqual(entities);
      expect(response.header).toHaveProperty('total-number', '2');
    });
  });

  describe('post', () => {
    it('should be able to create an entity', async () => {
      const response = await request.post(baseRoute).send({});

      expect(queries.insert).toHaveBeenCalledWith(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({ id: expect.any(String) })
      );
      expect(response.body).toStrictEqual({ id: 'new', name: 'test_new' });
    });

    it('should throw with invalid input body', async () => {
      const response = await request.post(baseRoute).send({ name: 1 });

      expect(response.status).toEqual(400);
    });
  });

  describe('getById', () => {
    it('should be able to get an entity by id', async () => {
      const response = await request.get(`${baseRoute}/1`);

      expect(queries.findById).toHaveBeenCalledWith('1');
      expect(response.body).toStrictEqual(entities[0]);
    });

    // This test case is actually nice-to-have. It's not required for the router to work.
    it('should throw with invalid id', async () => {
      const response = await request.get(`${baseRoute}/foo`);

      expect(response.status).toEqual(404);
    });
  });

  describe('patchById', () => {
    it('should be able to patch an entity by id', async () => {
      const response = await request.patch(`${baseRoute}/test`).send({ name: 'test_new' });

      expect(queries.updateById).toHaveBeenCalledWith('test', { name: 'test_new' });
      expect(response.body).toStrictEqual({ id: 'test', name: 'test_new' });
      expect(response.status).toEqual(200);
    });
  });

  describe('deleteById', () => {
    it('should be able to delete an entity by id', async () => {
      const response = await request.delete(`${baseRoute}/test`);

      expect(queries.deleteById).toHaveBeenCalledWith('test');
      expect(response.status).toEqual(204);
    });
  });

  describe('middlewares', () => {
    it('should allow status codes declared in middleware guard config with scope and method', async () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const throwingMiddleware: Middleware = async () => {
        throw new RequestError({ code: 'entity.not_found', status: 403 });
      };

      const schemaRouterWithMiddleware = new SchemaRouter(schema, queries, {
        middlewares: [
          {
            middleware: throwingMiddleware,
            scope: 'native',
            method: ['get'],
            status: [403],
          },
        ],
      });
      const requestWithMiddleware = createRequester({
        authedRoutes: (router) => router.use(schemaRouterWithMiddleware.routes()),
      });

      const response = await requestWithMiddleware.get(baseRoute);

      expect(response.status).toEqual(403);
    });

    it('should apply middleware to all methods when method is not specified', async () => {
      const callTracker = jest.fn();

      const trackingMiddleware: Middleware = async (ctx, next) => {
        callTracker(ctx.method);
        return next();
      };

      const schemaRouterWithMiddleware = new SchemaRouter(schema, queries, {
        middlewares: [
          {
            middleware: trackingMiddleware,
            scope: 'native',
          },
        ],
      });
      const requestWithMiddleware = createRequester({
        authedRoutes: (router) => router.use(schemaRouterWithMiddleware.routes()),
      });

      await requestWithMiddleware.get(baseRoute);
      await requestWithMiddleware.post(baseRoute).send({});
      await requestWithMiddleware.patch(`${baseRoute}/test`).send({ name: 'test' });

      expect(callTracker).toHaveBeenCalledTimes(3);
      expect(callTracker).toHaveBeenCalledWith('GET');
      expect(callTracker).toHaveBeenCalledWith('POST');
      expect(callTracker).toHaveBeenCalledWith('PATCH');
    });

    it('should only apply middleware to specified methods', async () => {
      const callTracker = jest.fn();

      const trackingMiddleware: Middleware = async (ctx, next) => {
        callTracker(ctx.method);
        return next();
      };

      const schemaRouterWithMiddleware = new SchemaRouter(schema, queries, {
        middlewares: [
          {
            middleware: trackingMiddleware,
            scope: 'native',
            method: ['get', 'post'],
          },
        ],
      });
      const requestWithMiddleware = createRequester({
        authedRoutes: (router) => router.use(schemaRouterWithMiddleware.routes()),
      });

      await requestWithMiddleware.get(baseRoute);
      await requestWithMiddleware.post(baseRoute).send({});
      await requestWithMiddleware.patch(`${baseRoute}/test`).send({ name: 'test' });

      expect(callTracker).toHaveBeenCalledTimes(2);
      expect(callTracker).toHaveBeenCalledWith('GET');
      expect(callTracker).toHaveBeenCalledWith('POST');
      expect(callTracker).not.toHaveBeenCalledWith('PATCH');
    });

    it('should apply middleware without scope to all routes', async () => {
      const callTracker = jest.fn();

      const trackingMiddleware: Middleware = async (ctx, next) => {
        callTracker();
        return next();
      };

      const schemaRouterWithMiddleware = new SchemaRouter(schema, queries, {
        middlewares: [
          {
            middleware: trackingMiddleware,
          },
        ],
      });
      const requestWithMiddleware = createRequester({
        authedRoutes: (router) => router.use(schemaRouterWithMiddleware.routes()),
      });

      await requestWithMiddleware.get(baseRoute);
      await requestWithMiddleware.post(baseRoute).send({});

      // Global middleware should be called for all routes
      expect(callTracker).toHaveBeenCalledTimes(2);
    });
  });

  describe('disable routes', () => {
    it('should be able to disable routes', async () => {
      const disabledSchemaRouter = new SchemaRouter(schema, queries, {
        disabled: { post: true, patchById: true, deleteById: true },
      });
      const disabledRequest = createRequester({
        authedRoutes: (router) => router.use(disabledSchemaRouter.routes()),
      });

      await disabledRequest.post(baseRoute).send({});
      expect(queries.insert).not.toHaveBeenCalled();

      await disabledRequest.patch(`${baseRoute}/test`).send({ name: 'test_new' });
      expect(queries.updateById).not.toHaveBeenCalled();

      await disabledRequest.delete(`${baseRoute}/test`);
      expect(queries.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('error handler', () => {
    it('should be able to customize error handler', async () => {
      const errorHandler = jest.fn();
      const errorHandlerSchemaRouter = new SchemaRouter(schema, queries, { errorHandler });
      const errorHandlerRequest = createRequester({
        authedRoutes: (router) => router.use(errorHandlerSchemaRouter.routes()),
      });

      await errorHandlerRequest.get(`${baseRoute}/foo`);
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});
