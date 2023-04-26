import { Hooks, hookConfigGuard } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function hookRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { findAllHooks, findHookById, insertHook, updateHookById, deleteHookById } = queries.hooks;

  router.get(
    '/hooks',
    koaGuard({ response: Hooks.guard.array(), status: 200 }),
    async (ctx, next) => {
      ctx.body = await findAllHooks();

      return next();
    }
  );

  router.post(
    '/hooks',
    koaGuard({
      body: Hooks.createGuard
        .omit({ id: true, enabled: true })
        .extend({ config: hookConfigGuard.omit({ signingKey: true }) }),
      response: Hooks.guard,
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { config, ...rest } = ctx.guard.body;

      ctx.body = await insertHook({
        ...rest,
        id: generateStandardId(),
        config: {
          ...config,
          signingKey: generateStandardId(),
        },
        enabled: true,
      });

      return next();
    }
  );

  router.get(
    '/hooks/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: Hooks.guard,
      status: [200, 404],
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
    '/hooks/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: Hooks.createGuard
        .pick({ name: true, events: true })
        .extend({ config: hookConfigGuard.omit({ signingKey: true }).partial() })
        .partial(),
      response: Hooks.guard,
      status: [200, 422, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const hook = await findHookById(id);
      const { config } = hook;

      ctx.body = await updateHookById(id, {
        ...body,
        config: { ...config, ...body.config },
      });

      return next();
    }
  );

  router.patch(
    '/hooks/:id/signing-key',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: Hooks.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      const { config } = await findHookById(id);
      const hook = await updateHookById(id, {
        config: { ...config, signingKey: generateStandardId() },
      });

      ctx.body = hook;

      return next();
    }
  );

  router.patch(
    '/hooks/:id/enabled',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({ enabled: z.boolean() }),
      response: Hooks.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { enabled },
      } = ctx.guard;

      const hook = await updateHookById(id, { enabled });

      ctx.body = hook;

      return next();
    }
  );

  router.delete(
    '/hooks/:id',
    koaGuard({ params: z.object({ id: z.string().min(1) }), status: [204, 404] }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await deleteHookById(id);
      ctx.status = 204;

      return next();
    }
  );
}
