import { LogtoInlineHookKey, inlineHookGuard } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

const inlineHookConfigsGuard = z.object({
  key: z.nativeEnum(LogtoInlineHookKey),
  value: inlineHookGuard,
});

export default function logtoConfigInlineHookRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, logtoConfigs }]: RouterInitArgs<T>
) {
  const { getRowsByKeys, deleteInlineHook } = queries.logtoConfigs;
  const { upsertInlineHook, getInlineHook, getInlineHooks, updateInlineHook } = logtoConfigs;

  router.get(
    '/configs/inline-hooks',
    koaGuard({
      response: inlineHookConfigsGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const inlineHooks = await getInlineHooks(getConsoleLogFromContext(ctx));
      ctx.body = Object.values(LogtoInlineHookKey)
        .filter((key) => inlineHooks[key])
        .map((key) => ({ key, value: inlineHooks[key] }));
      return next();
    }
  );

  router.get(
    '/configs/inline-hooks/:hookType',
    koaGuard({
      params: z.object({
        hookType: z.nativeEnum(LogtoInlineHookKey),
      }),
      response: inlineHookGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { hookType },
      } = ctx.guard;

      ctx.body = await getInlineHook(hookType);
      return next();
    }
  );

  router.put(
    '/configs/inline-hooks/:hookType',
    koaGuard({
      params: z.object({
        hookType: z.nativeEnum(LogtoInlineHookKey),
      }),
      body: inlineHookGuard,
      response: inlineHookGuard,
      status: [200, 201, 400],
    }),
    async (ctx, next) => {
      const {
        params: { hookType },
        body,
      } = ctx.guard;

      const { rows } = await getRowsByKeys([hookType]);
      const inlineHook = await upsertInlineHook(hookType, body);

      if (rows.length === 0) {
        ctx.status = 201;
      }

      ctx.body = inlineHook.value;
      return next();
    }
  );

  router.patch(
    '/configs/inline-hooks/:hookType',
    koaGuard({
      params: z.object({
        hookType: z.nativeEnum(LogtoInlineHookKey),
      }),
      body: inlineHookGuard.partial(),
      response: inlineHookGuard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { hookType },
        body,
      } = ctx.guard;

      ctx.body = await updateInlineHook(hookType, body);
      return next();
    }
  );

  router.delete(
    '/configs/inline-hooks/:hookType',
    koaGuard({
      params: z.object({
        hookType: z.nativeEnum(LogtoInlineHookKey),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { hookType },
      } = ctx.guard;

      await deleteInlineHook(hookType);
      ctx.status = 204;
      return next();
    }
  );
}
