import { generateStandardId } from '@logto/core-kit';
import { Hooks } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function hookRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { findAllHooks, findHookById, insertHook, updateHookById, deleteHookById } = queries.hooks;

  router.get('/hooks', async (ctx, next) => {
    ctx.body = await findAllHooks();

    return next();
  });

  router.post(
    '/hooks',
    koaGuard({ body: Hooks.createGuard.omit({ id: true }) }),
    async (ctx, next) => {
      ctx.body = await insertHook({
        id: generateStandardId(),
        ...ctx.guard.body,
      });

      return next();
    }
  );

  router.get(
    '/hooks/:id',
    koaGuard({ params: z.object({ id: z.string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findHookById(id);

      return next();
    }
  );

  router.patch(
    '/hooks/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: Hooks.createGuard.omit({ id: true }).partial(),
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
    '/hooks/:id',
    koaGuard({ params: z.object({ id: z.string().min(1) }) }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await deleteHookById(id);
      ctx.status = 204;

      return next();
    }
  );
}
