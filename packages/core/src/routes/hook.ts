import { Hooks } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import {
  deleteHookById,
  findAllHooks,
  findHookById,
  findTotalNumberOfHooks,
  insertHook,
  updateHookById,
} from '@/queries/hook';

import type { AuthedRouter } from './types';

export default function hookRoutes<T extends AuthedRouter>(baseRouter: T) {
  const router: AuthedRouter = new Router();

  router.post(
    '/',
    koaGuard({ body: Hooks.createGuard.omit({ id: true }), response: Hooks.guard, status: 200 }),
    async (ctx, next) => {
      ctx.body = await insertHook({
        id: generateStandardId(),
        ...ctx.guard.body,
      });

      return next();
    }
  );

  router.get(
    '/',
    koaPagination(),
    koaGuard({ response: Hooks.guard.array(), status: 200 }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;

      const [{ count }, hooks] = await Promise.all([
        findTotalNumberOfHooks(),
        findAllHooks(limit, offset),
      ]);
      ctx.pagination.totalCount = count;
      ctx.body = hooks;

      return next();
    }
  );

  router.get(
    '/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: Hooks.guard,
      status: 200,
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findHookById(id);

      return next();
    }
  );

  router.patch(
    '/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: Hooks.createGuard.omit({ id: true }).deepPartial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      ctx.body = await updateHookById(id, body);

      return next();
    }
  );

  router.delete(
    '/:id',
    koaGuard({ params: z.object({ id: z.string().min(1) }) }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await findHookById(id);
      await deleteHookById(id);
      ctx.status = 204;

      return next();
    }
  );

  baseRouter.use('/hooks', router.routes(), router.allowedMethods());
}
