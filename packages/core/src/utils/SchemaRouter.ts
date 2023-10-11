import { type SchemaLike, type GeneratedSchema } from '@logto/schemas';
import Router, { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination, { type Pagination } from '#src/middleware/koa-pagination.js';

/**
 * Actions configuration for a {@link SchemaRouter}. It contains the
 * necessary functions to handle the CRUD operations for a schema.
 */
export abstract class SchemaActions<
  CreateSchema extends SchemaLike,
  Schema extends CreateSchema,
  PostSchema extends Partial<Schema>,
  PatchSchema extends Partial<Schema>,
> {
  /**
   * The guard for the `POST /` request body. You can specify a partial
   * schema and disable some fields for business logic reasons, such as
   * id and createdAt.
   *
   * @see {@link post} for the function to create an entity.
   */
  public abstract postGuard: z.ZodType<PostSchema>;

  /**
   * The guard for the `PATCH /:id` request body. You can specify a
   * partial schema and disable some fields for business logic reasons.
   *
   * @see {@link patchById} for the function to update an entity.
   */
  public abstract patchGuard: z.ZodType<PatchSchema>;

  /**
   * The function for `GET /` route to get a list of entities.
   *
   * @param pagination The request pagination info parsed from `koa-pagination`. The
   * function should honor the pagination info and return the correct entities.
   * @returns A tuple of `[count, entities]`. `count` is the total count of entities
   *  in the database; `entities` is the list of entities to be returned.
   */
  public abstract get(
    pagination: Pick<Pagination, 'limit' | 'offset'>
  ): Promise<[count: number, entities: readonly Schema[]]>;
  /**
   * The function for `GET /:id` route to get an entity by ID.
   *
   * @param id The ID of the entity to be fetched.
   * @returns The entity to be returned.
   */
  public abstract getById(id: string): Promise<Readonly<Schema>>;
  /**
   * The function for `POST /` route to create an entity.
   *
   * @param data The data of the entity to be created.
   * @returns The created entity.
   */
  public abstract post(data: PostSchema): Promise<Readonly<Schema>>;

  /**
   * The function for `PATCH /:id` route to update the entity by ID.
   *
   * @param id The ID of the entity to be updated.
   * @param data The data of the entity to be updated.
   * @returns The updated entity.
   */
  public abstract patchById(id: string, data: PatchSchema): Promise<Readonly<Schema>>;

  /**
   * The function for `DELETE /:id` route to delete an entity by ID.
   *
   * @param id The ID of the entity to be deleted.
   */
  public abstract deleteById(id: string): Promise<void>;
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
  CreateSchema extends SchemaLike,
  Schema extends CreateSchema,
  PostSchema extends Partial<Schema> = Partial<Schema>,
  PatchSchema extends Partial<Schema> = Partial<Schema>,
  StateT = unknown,
  CustomT extends IRouterParamContext = IRouterParamContext,
> extends Router<StateT, CustomT> {
  constructor(
    public readonly schema: GeneratedSchema<CreateSchema, Schema>,
    public readonly actions: SchemaActions<CreateSchema, Schema, PostSchema, PatchSchema>
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
        body: actions.postGuard,
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
        body: actions.patchGuard,
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
