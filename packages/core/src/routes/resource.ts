import { Resources } from '@logto/schemas';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import {
  findTotalNumberOfResources,
  findAllResources,
  findResourceById,
  insertResource,
  updateResourceById,
  deleteResourceById,
} from '@/queries/resource';
import { findAllScopesWithResourceId } from '@/queries/scope';
import { buildIdGenerator } from '@/utils/id';

import { AuthedRouter } from './types';

const resourceId = buildIdGenerator(21);

export default function resourceRoutes<T extends AuthedRouter>(router: T) {
  router.get('/resources', koaPagination(), async (ctx, next) => {
    const { limit, offset } = ctx.pagination;

    const [{ count }, resources] = await Promise.all([
      findTotalNumberOfResources(),
      findAllResources(limit, offset),
    ]);

    ctx.pagination.totalCount = count;

    // TODO: query scopes of all resources and insert into the response data
    ctx.body = resources;

    return next();
  });

  router.post(
    '/resources',
    koaGuard({
      body: Resources.guard.omit({ id: true }),
    }),
    async (ctx, next) => {
      const resource = await insertResource({
        id: resourceId(),
        ...ctx.guard.body,
      });

      ctx.body = { ...resource, scopes: [] };

      return next();
    }
  );

  router.get(
    '/resources/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      const [resource, scopes] = await Promise.all([
        findResourceById(id),
        findAllScopesWithResourceId(id),
      ]);

      ctx.body = { ...resource, scopes };
      return next();
    }
  );

  router.patch(
    '/resources/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Resources.guard.omit({ id: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const [scopes, resource] = await Promise.all([
        findAllScopesWithResourceId(id),
        updateResourceById(id, body),
      ]);

      ctx.body = { ...resource, scopes };
      return next();
    }
  );

  router.delete(
    '/resources/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await findResourceById(id);
      await deleteResourceById(id);
      ctx.status = 204;
      return next();
    }
  );
}
