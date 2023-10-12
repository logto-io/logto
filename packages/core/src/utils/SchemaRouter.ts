import { type SchemaLike, type GeneratedSchema, type Guard } from '@logto/schemas';
import { generateStandardId, type OmitAutoSetFields } from '@logto/shared';
import Router, { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination, { type Pagination } from '#src/middleware/koa-pagination.js';

import type SchemaQueries from './SchemaQueries.js';

/**
 * Actions configuration for a {@link SchemaRouter}. It contains the
 * necessary functions to handle the CRUD operations for a schema.
 */
export class SchemaActions<
  Key extends string,
  CreateSchema extends Partial<SchemaLike<Key> & { id: string }>,
  Schema extends SchemaLike<Key> & { id: string },
> {
  constructor(public readonly queries: SchemaQueries<Key, CreateSchema, Schema>) {}

  /**
   * The function for `GET /` route to get a list of entities.
   *
   * @param pagination The request pagination info parsed from `koa-pagination`. The
   * function should honor the pagination info and return the correct entities.
   * @returns A tuple of `[count, entities]`. `count` is the total count of entities
   *  in the database; `entities` is the list of entities to be returned.
   */
  public async get({
    limit,
    offset,
  }: Pick<Pagination, 'limit' | 'offset'>): Promise<[count: number, entities: readonly Schema[]]> {
    return Promise.all([this.queries.findTotalNumber(), this.queries.findAll(limit, offset)]);
  }

  /**
   * The function for `GET /:id` route to get an entity by ID.
   *
   * @param id The ID of the entity to be fetched.
   * @returns The entity to be returned.
   */
  public async getById(id: string): Promise<Readonly<Schema>> {
    return this.queries.findById(id);
  }

  /**
   * The function for `POST /` route to create an entity.
   *
   * @param data The data of the entity to be created.
   * @returns The created entity.
   */
  public async post(data: Omit<OmitAutoSetFields<CreateSchema>, 'id'>): Promise<Readonly<Schema>>;
  public async post(data: OmitAutoSetFields<CreateSchema>): Promise<Readonly<Schema>> {
    return this.queries.insert({ id: generateStandardId(), ...data });
  }

  /**
   * The function for `PATCH /:id` route to update the entity by ID.
   *
   * @param id The ID of the entity to be updated.
   * @param data The data of the entity to be updated.
   * @returns The updated entity.
   */
  public async patchById(id: string, data: Partial<Schema>): Promise<Readonly<Schema>> {
    return this.queries.updateById(id, data);
  }

  /**
   * The function for `DELETE /:id` route to delete an entity by ID.
   *
   * @param id The ID of the entity to be deleted.
   */
  public async deleteById(id: string): Promise<void> {
    return this.queries.deleteById(id);
  }
}

/**
 * A standard RESTful router for a schema.
 *
 * It provides the following routes by configuring the `actions`:
 *
 * - `GET /`: Get a list of entities.
 * - `POST /`: Create an entity.
 * - `GET /:id`: Get an entity by ID.
 * - `PATCH /:id`: Update an entity by ID.
 * - `DELETE /:id`: Delete an entity by ID.
 *
 * Browse the source code for more details about request/response validation.
 *
 * @see {@link SchemaActions} for the `actions` configuration.
 */
export default class SchemaRouter<
  Key extends string,
  CreateSchema extends Partial<SchemaLike<Key> & { id: string }>,
  Schema extends SchemaLike<Key> & { id: string },
  StateT = unknown,
  CustomT extends IRouterParamContext = IRouterParamContext,
> extends Router<StateT, CustomT> {
  constructor(
    public readonly schema: GeneratedSchema<Key, CreateSchema, Schema>,
    public readonly actions: SchemaActions<Key, CreateSchema, Schema>
  ) {
    super({ prefix: '/' + schema.table.replaceAll('_', '-') });

    this.get(
      '/',
      koaPagination(),
      koaGuard({ response: schema.guard.array(), status: [200] }),
      async (ctx, next) => {
        const [count, entities] = await actions.get(ctx.pagination);
        ctx.pagination.totalCount = count;
        ctx.body = entities;
        return next();
      }
    );

    this.post(
      '/',
      koaGuard({
        // eslint-disable-next-line no-restricted-syntax -- `.omit()` doesn't play well for generic types
        body: schema.createGuard.omit({ id: true }) as Guard<Omit<CreateSchema, 'id'>>,
        response: schema.guard,
        status: [201, 422],
      }),
      async (ctx, next) => {
        ctx.body = await actions.post(ctx.guard.body);
        ctx.status = 201;
        return next();
      }
    );

    this.get(
      '/:id',
      koaGuard({
        params: z.object({ id: z.string().min(1) }),
        response: schema.guard,
        status: [200, 404],
      }),
      async (ctx, next) => {
        ctx.body = await actions.getById(ctx.guard.params.id);
        return next();
      }
    );

    this.patch(
      '/:id',
      koaGuard({
        params: z.object({ id: z.string().min(1) }),
        body: schema.updateGuard,
        response: schema.guard,
        status: [200, 404],
      }),
      async (ctx, next) => {
        ctx.body = await actions.patchById(ctx.guard.params.id, ctx.guard.body);
        return next();
      }
    );

    this.delete(
      '/:id',
      koaGuard({
        params: z.object({ id: z.string().min(1) }),
        status: [204, 404],
      }),
      async (ctx, next) => {
        await actions.deleteById(ctx.guard.params.id);
        ctx.status = 204;
        return next();
      }
    );
  }
}
