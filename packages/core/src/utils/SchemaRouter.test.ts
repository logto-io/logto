import { type GeneratedSchema } from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';

import SchemaRouter, { type SchemaActions } from './SchemaRouter.js';
import { createRequester } from './test-utils.js';

const { jest } = import.meta;

type CreateSchema = {
  id?: string;
};

type Schema = {
  id: string;
};

describe('SchemaRouter', () => {
  const schema: GeneratedSchema<CreateSchema, Schema> = {
    table: 'test_table',
    tableSingular: 'test_table',
    fields: {
      id: 'id',
    },
    fieldKeys: ['id'],
    createGuard: z.object({ id: z.string().optional() }),
    guard: z.object({ id: z.string() }),
  };
  const entities = [{ id: 'test' }, { id: 'test2' }] as const satisfies readonly Schema[];
  const actions: SchemaActions<CreateSchema, Schema, CreateSchema, CreateSchema> = {
    get: jest.fn().mockResolvedValue([entities.length, entities]),
    getById: jest.fn(async (id) => {
      const entity = entities.find((entity) => entity.id === id);
      if (!entity) {
        throw new RequestError({ code: 'entity.not_found', status: 404 });
      }
      return entity;
    }),
    postGuard: z.object({ id: z.string().optional() }),
    post: jest.fn(async () => ({ id: 'test_new' })),
    patchGuard: z.object({ id: z.string().optional() }),
    patchById: jest.fn(async (id, data) => ({ id, ...data })),
    deleteById: jest.fn(),
  };
  const schemaRouter = new SchemaRouter(schema, actions);
  const request = createRequester({ authedRoutes: (router) => router.use(schemaRouter.routes()) });
  const baseRoute = `/${schema.table.replaceAll('_', '-')}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should be able to get all entities', async () => {
      const response = await request.get(baseRoute);

      expect(actions.get).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false, offset: 0, limit: 20 })
      );
      expect(response.body).toStrictEqual(entities);
    });

    it('should be able to get all entities with pagination', async () => {
      const response = await request.get(`${baseRoute}?page=1&page_size=10`);

      expect(actions.get).toHaveBeenCalledWith(expect.objectContaining({ offset: 0, limit: 10 }));
      expect(response.body).toStrictEqual(entities);
      expect(response.header).toHaveProperty('total-number', '2');
    });
  });

  describe('post', () => {
    it('should be able to create an entity', async () => {
      const response = await request.post(baseRoute).send({});

      expect(actions.post).toHaveBeenCalledWith({});
      expect(response.body).toStrictEqual({ id: 'test_new' });
    });

    it('should throw with invalid input body', async () => {
      const response = await request.post(baseRoute).send({ id: 1 });

      expect(response.status).toEqual(400);
    });
  });

  describe('getById', () => {
    it('should be able to get an entity by id', async () => {
      const response = await request.get(`${baseRoute}/test`);

      expect(actions.getById).toHaveBeenCalledWith('test');
      expect(response.body).toStrictEqual(entities[0]);
    });

    // This test case is actually nice-to-have. It's not required for the router to work.
    it('should throw with invalid id', async () => {
      const response = await request.get(`${baseRoute}/2`);

      expect(response.status).toEqual(404);
    });
  });

  describe('patchById', () => {
    it('should be able to patch an entity by id', async () => {
      const response = await request.patch(`${baseRoute}/test`).send({ id: 'test_new' });

      expect(actions.patchById).toHaveBeenCalledWith('test', { id: 'test_new' });
      expect(response.body).toStrictEqual({ id: 'test_new' });
      expect(response.status).toEqual(200);
    });
  });

  describe('deleteById', () => {
    it('should be able to delete an entity by id', async () => {
      const response = await request.delete(`${baseRoute}/test`);

      expect(actions.deleteById).toHaveBeenCalledWith('test');
      expect(response.status).toEqual(204);
    });
  });
});
