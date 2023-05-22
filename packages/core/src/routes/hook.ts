import { Hooks, Logs, hookEventsGuard } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, deduplicate } from '@silverhand/essentials';
import { subDays } from 'date-fns';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

const nonemptyUniqueHookEventsGuard = hookEventsGuard
  .nonempty()
  .transform((events) => deduplicate(events));

export default function hookRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    hooks: { findAllHooks, findHookById, insertHook, updateHookById, deleteHookById },
    logs: { countLogs, findLogs },
  } = queries;

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
      params: z.object({ id: z.string() }),
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

  router.get(
    '/hooks/:id/recent-logs',
    koaPagination(),
    koaGuard({
      params: z.object({ id: z.string() }),
      query: z.object({ logKey: z.string().optional() }),
      response: Logs.guard.omit({ tenantId: true }).array(),
      status: 200,
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;

      const {
        params: { id },
        query: { logKey },
      } = ctx.guard;

      const startTimeExclusive = subDays(new Date(), 1).getTime();

      const [{ count }, logs] = await Promise.all([
        countLogs({ logKey, hookId: id, startTimeExclusive }),
        findLogs(limit, offset, { logKey, hookId: id, startTimeExclusive }),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = logs;

      return next();
    }
  );

  router.post(
    '/hooks',
    koaGuard({
      body: Hooks.createGuard.omit({ id: true, signingKey: true }).extend({
        events: nonemptyUniqueHookEventsGuard.optional(),
      }),
      response: Hooks.guard,
      status: [201, 400],
    }),
    async (ctx, next) => {
      const { event, events, enabled, ...rest } = ctx.guard.body;
      assertThat(events ?? event, new RequestError({ code: 'hook.missing_events', status: 400 }));

      ctx.body = await insertHook({
        ...rest,
        id: generateStandardId(),
        signingKey: generateStandardId(),
        events: events ?? [],
        enabled: enabled ?? true,
        ...conditional(event && { event }),
      });

      ctx.status = 201;

      return next();
    }
  );

  router.patch(
    '/hooks/:id',
    koaGuard({
      params: z.object({ id: z.string() }),
      body: Hooks.createGuard
        .omit({ id: true, signingKey: true })
        .extend({
          events: nonemptyUniqueHookEventsGuard,
        })
        .partial(),
      response: Hooks.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      ctx.body = await updateHookById(id, body, 'replace');

      return next();
    }
  );

  router.patch(
    '/hooks/:id/signing-key',
    koaGuard({
      params: z.object({ id: z.string() }),
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

  router.delete(
    '/hooks/:id',
    koaGuard({ params: z.object({ id: z.string() }), status: [204, 404] }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await deleteHookById(id);
      ctx.status = 204;

      return next();
    }
  );
}
