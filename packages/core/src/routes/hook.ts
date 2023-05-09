import { Hooks, hookEventsGuard } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { string, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

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

  router.post(
    '/hooks',
    koaGuard({
      body: Hooks.createGuard
        .omit({ id: true, name: true, signingKey: true, enabled: true, events: true })
        .extend({
          // Note: ensure the user will not create a hook with an empty name.
          name: string().min(1).optional(),
          events: hookEventsGuard.nonempty().optional(),
        }),
      response: Hooks.guard,
      status: 200,
    }),
    async (ctx, next) => {
      const { event, events, ...rest } = ctx.guard.body;
      assertThat(events ?? event, new RequestError({ code: 'hook.missing_events', status: 422 }));

      ctx.body = await insertHook({
        ...rest,
        id: generateStandardId(),
        signingKey: generateStandardId(),
        enabled: true,
        ...conditional(event && { event }),
        ...conditional(events && { events }),
      });

      return next();
    }
  );

  router.post(
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

      ctx.body = await updateHookById(id, {
        signingKey: generateStandardId(),
      });

      return next();
    }
  );

  router.patch(
    '/hooks/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: Hooks.createGuard
        .omit({ id: true, name: true, signingKey: true, events: true })
        .deepPartial()
        .extend({
          // Note: ensure the user will not update the name to empty
          name: string().min(1).optional(),
          events: hookEventsGuard.nonempty().optional(),
        }),
      response: Hooks.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { config: configToUpdate, ...rest } = body;

      const hook = await findHookById(id);
      const { config } = hook;

      ctx.body = await updateHookById(id, {
        ...rest,
        config: { ...config, ...configToUpdate },
      });

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
