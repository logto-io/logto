import {
  Hooks,
  Logs,
  ProductEvent,
  type WebhookLogPrefix,
  devFeatureHookEvents,
  hook,
  hookConfigGuard,
  hookEvents,
  hookResponseGuard,
  type Hook,
  type HookResponse,
} from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { conditional, deduplicate, yes } from '@silverhand/essentials';
import { subDays } from 'date-fns';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { koaReportSubscriptionUpdates, koaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { parseTimestampParam, validateTimeWindow } from '#src/utils/time-window.js';

import { captureEvent } from '../utils/posthog.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

const devFeatureHookEventSet = new Set<string>(devFeatureHookEvents);
const isHookEventAvailable = (event: string) =>
  EnvSet.values.isDevFeaturesEnabled || !devFeatureHookEventSet.has(event);

export default function hookRoutes<T extends ManagementApiRouter>(
  ...[router, { id: tenantId, queries, libraries }]: RouterInitArgs<T>
) {
  const availableHookEvents = [
    hookEvents[0],
    ...hookEvents.slice(1).filter((event) => isHookEventAvailable(event)),
  ] satisfies [string, ...string[]];
  const availableHookEventGuard = z.enum(availableHookEvents);
  const nonemptyUniqueHookEventsGuard = availableHookEventGuard
    .array()
    .nonempty()
    .transform((events) => deduplicate(events));
  const availableHookOpenApiGuard = Hooks.guard.extend({
    event: availableHookEventGuard.nullable(),
    events: availableHookEventGuard.array(),
  });
  const availableHookResponseOpenApiGuard = hookResponseGuard.extend({
    event: availableHookEventGuard.nullable(),
    events: availableHookEventGuard.array(),
  });

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
      responseForOpenApi: availableHookResponseOpenApiGuard
        .partial({ executionStats: true })
        .array(),
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
      responseForOpenApi: availableHookResponseOpenApiGuard.partial({ executionStats: true }),
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
      query: z.object({
        logKey: z.string().optional(),
        enableCap: z.string().optional(),
        start_time: z.string().optional(),
        end_time: z.string().optional(),
      }),
      response: Logs.guard.omit({ tenantId: true }).array(),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;

      const {
        params: { id },
        query: { logKey, enableCap, start_time, end_time },
      } = ctx.guard;

      const userStart = parseTimestampParam(start_time, 'start_time');
      const userEnd = parseTimestampParam(end_time, 'end_time');
      validateTimeWindow(userStart, userEnd);

      const includeKeyPrefix: WebhookLogPrefix[] = [hook.Type.TriggerHook];
      // Backward compat: when neither time param is supplied, fall back to the
      // historical 24h lower bound. When the caller supplies either bound,
      // honor their window as-is and skip the default.
      const hasExplicitWindow = userStart !== undefined || userEnd !== undefined;
      const startTime = hasExplicitWindow ? userStart : subDays(new Date(), 1).getTime();
      const endTime = userEnd;

      const [{ count, isCapped }, logs] = await Promise.all([
        countLogs(
          {
            logKey,
            payload: { hookId: id },
            startTime,
            endTime,
            includeKeyPrefix,
          },
          { capped: yes(enableCap) }
        ),
        findLogs(limit, offset, {
          logKey,
          payload: { hookId: id },
          startTime,
          endTime,
          includeKeyPrefix,
        }),
      ]);

      ctx.pagination.totalCount = count;
      ctx.pagination.totalCountIsCapped = isCapped;
      ctx.body = logs;

      return next();
    }
  );

  router.post(
    '/hooks',
    koaQuotaGuard({ key: 'hooksLimit', quota }),
    koaGuard({
      body: Hooks.createGuard.omit({ id: true, signingKey: true }).extend({
        event: availableHookEventGuard.optional(),
        events: nonemptyUniqueHookEventsGuard.optional(),
      }),
      response: Hooks.guard,
      responseForOpenApi: availableHookOpenApiGuard,
      status: [201, 400],
    }),
    koaReportSubscriptionUpdates({
      key: 'hooksLimit',
      quota,
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

      captureEvent({ tenantId, request: ctx.req }, ProductEvent.WebhookCreated);
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
          event: availableHookEventGuard.nullable().optional(),
          events: nonemptyUniqueHookEventsGuard,
        })
        .partial(),
      response: Hooks.guard,
      responseForOpenApi: availableHookOpenApiGuard,
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
      responseForOpenApi: availableHookOpenApiGuard,
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
    koaReportSubscriptionUpdates({
      key: 'hooksLimit',
      quota,
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await deleteHookById(id);
      ctx.status = 204;

      captureEvent({ tenantId, request: ctx.req }, ProductEvent.WebhookDeleted);
      return next();
    }
  );
}
