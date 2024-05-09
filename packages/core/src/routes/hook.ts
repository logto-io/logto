import {
  Hooks,
  Logs,
  hook,
  hookConfigGuard,
  hookEventsGuard,
  hookResponseGuard,
  type Hook,
  type HookResponse,
} from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { conditional, deduplicate, yes } from '@silverhand/essentials';
import { subDays } from 'date-fns';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaQuotaGuard from '#src/middleware/koa-quota-guard.js';
import { type AllowedKeyPrefix } from '#src/queries/log.js';
import assertThat from '#src/utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

const nonemptyUniqueHookEventsGuard = hookEventsGuard
  .nonempty()
  .transform((events) => deduplicate(events));

export default function hookRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    hooks: {
      getTotalNumberOfHooks,
      findAllHooks,
      findHookById,
      insertHook,
      updateHookById,
      deleteHookById,
    },
    logs: { countLogs, findLogs, getHookExecutionStatsByHookId },
  } = queries;

  const {
    hooks: { triggerTestHook },
    quota,
  } = libraries;

  const attachExecutionStatsToHook = async (hook: Hook): Promise<HookResponse> => ({
    ...hook,
    executionStats: await getHookExecutionStatsByHookId(hook.id),
  });

  router.get(
    '/hooks',
    koaPagination({ isOptional: true }),
    koaGuard({
      query: z.object({ includeExecutionStats: z.string().optional() }),
      response: hookResponseGuard.partial({ executionStats: true }).array(),
      status: 200,
    }),
    async (ctx, next) => {
      const {
        query: { includeExecutionStats },
      } = ctx.guard;

      const { limit, offset, disabled: isPaginationDisabled } = ctx.pagination;

      if (isPaginationDisabled) {
        const hooks = await findAllHooks();

        ctx.body = yes(includeExecutionStats)
          ? await Promise.all(hooks.map(async (hook) => attachExecutionStatsToHook(hook)))
          : hooks;

        return next();
      }

      const [{ count }, hooks] = await Promise.all([
        getTotalNumberOfHooks(),
        findAllHooks(limit, offset),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = yes(includeExecutionStats)
        ? await Promise.all(hooks.map(async (hook) => attachExecutionStatsToHook(hook)))
        : hooks;

      return next();
    }
  );

  router.get(
    '/hooks/:id',
    koaGuard({
      params: z.object({ id: z.string() }),
      query: z.object({ includeExecutionStats: z.string().optional() }),
      response: hookResponseGuard.partial({ executionStats: true }),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        query: { includeExecutionStats },
      } = ctx.guard;

      const hook = await findHookById(id);

      ctx.body = includeExecutionStats ? await attachExecutionStatsToHook(hook) : hook;

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

      const includeKeyPrefix: AllowedKeyPrefix[] = [hook.Type.TriggerHook];
      const startTimeExclusive = subDays(new Date(), 1).getTime();

      const [{ count }, logs] = await Promise.all([
        countLogs({
          logKey,
          payload: { hookId: id },
          startTimeExclusive,
          includeKeyPrefix,
        }),
        findLogs(limit, offset, {
          logKey,
          payload: { hookId: id },
          startTimeExclusive,
          includeKeyPrefix,
        }),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = logs;

      return next();
    }
  );

  router.post(
    '/hooks',
    koaQuotaGuard({ key: 'hooksLimit', quota }),
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
        signingKey: generateStandardSecret(),
        events: events ?? [],
        enabled: enabled ?? true,
        ...conditional(event && { event }),
      });

      ctx.status = 201;

      return next();
    }
  );

  router.post(
    '/hooks/:id/test',
    koaGuard({
      params: z.object({ id: z.string() }),
      body: z.object({ events: nonemptyUniqueHookEventsGuard, config: hookConfigGuard }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { events, config },
      } = ctx.guard;

      await triggerTestHook(id, events, config);

      ctx.status = 204;

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
        signingKey: generateStandardSecret(),
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
