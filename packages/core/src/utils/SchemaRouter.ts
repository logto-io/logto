import { type SchemaLike, type GeneratedSchema } from '@logto/schemas';
import Router, { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination, { type Pagination } from '#src/middleware/koa-pagination.js';

type SchemaActions<
  CreateSchema extends SchemaLike,
  Schema extends CreateSchema,
  UpdateSchema extends Partial<Schema>,
> = {
  findAll: (pagination: Pagination) => Promise<[count: number, entities: readonly Schema[]]>;
  findById: (id: string) => Promise<Readonly<Schema>>;
  insert: (data: CreateSchema) => Promise<Readonly<Schema>>;
  updateGuard: z.ZodType<UpdateSchema>;
  updateById: (id: string, data: UpdateSchema) => Promise<Readonly<Schema>>;
  deleteById: (id: string) => Promise<void>;
};

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
        const [count, entities] = await actions.findAll(ctx.pagination);
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
        ctx.body = await actions.insert(ctx.guard.body);
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
        ctx.body = await actions.findById(ctx.guard.params.id);
        return next();
      }
    );

    this.patch(
      '/:id',
      koaGuard({
        params: z.object({ id: z.string().min(1) }),
        body: actions.updateGuard,
        response: schema.guard,
        status: [200, 404],
      }),
      async (ctx, next) => {
        void actions.updateById(ctx.guard.params.id, ctx.guard.body);
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
