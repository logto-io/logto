import { type SchemaLike, type GeneratedSchema } from '@logto/schemas';
import Router, { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination, { type Pagination } from '#src/middleware/koa-pagination.js';

/**
 * Actions configuration for a {@link SchemaRouter}.
 */
export type SchemaActions<
  CreateSchema extends SchemaLike,
  Schema extends CreateSchema,
  UpdateSchema extends Partial<Schema>,
> = {
  /**
   * The function for `GET /` route to get a list of entities.
   *
   * @param pagination The request pagination info parsed from `koa-pagination`. If
   * pagination is disabled, the function should return all entities.
   * @returns A tuple of `[count, entities]`. `count` is the total count of entities
   *  in the database; `entities` is the list of entities to be returned.
   */
  get: (pagination: Pagination) => Promise<[count: number, entities: readonly Schema[]]>;
  /**
   * The function for `GET /:id` route to get an entity by ID.
   *
   * @param id The ID of the entity to be fetched.
   * @returns The entity to be returned.
   */
  getById: (id: string) => Promise<Readonly<Schema>>;
  /**
   * The function for `POST /` route to create an entity.
   *
   * @param data The data of the entity to be created.
   * @returns The created entity.
   */
  post: (data: CreateSchema) => Promise<Readonly<Schema>>;
  /**
   * The configuration for `PATCH /:id` route to update an entity by ID.
   * It contains a `guard` for the request body and a `run` function to update the entity.
   */
  patchById: {
    /**
     * The guard for the request body. You can specify a partial schema and disable
     * some fields for business logic reasons.
     */
    guard: z.ZodType<UpdateSchema>;
    /**
     * The function to update the entity by ID.
     *
     * @param id The ID of the entity to be updated.
     * @param data The data of the entity to be updated.
     * @returns The updated entity.
     */
    run: (id: string, data: UpdateSchema) => Promise<Readonly<Schema>>;
  };
  /**
   * The function for `DELETE /:id` route to delete an entity by ID.
   *
   * @param id The ID of the entity to be deleted.
   */
  deleteById: (id: string) => Promise<void>;
};

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
  CreateSchema extends SchemaLike,
  Schema extends CreateSchema,
  UpdateSchema extends Partial<Schema> = Partial<Schema>,
  StateT = unknown,
  CustomT extends IRouterParamContext = IRouterParamContext,
> extends Router<StateT, CustomT> {
  constructor(
    public readonly schema: GeneratedSchema<CreateSchema, Schema>,
    public readonly actions: SchemaActions<CreateSchema, Schema, UpdateSchema>
  ) {
    super({ prefix: '/' + schema.table.replaceAll('_', '-') });

    this.get(
      '/',
      koaPagination({ isOptional: true }),
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
        body: schema.createGuard,
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
        body: actions.patchById.guard,
        response: schema.guard,
        status: [200, 404],
      }),
      async (ctx, next) => {
        ctx.body = await actions.patchById.run(ctx.guard.params.id, ctx.guard.body);
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
