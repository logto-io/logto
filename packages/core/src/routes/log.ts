import {
  logResponseGuard,
  action,
  interaction,
  token,
  LogKeyUnknown,
  jwtCustomizer,
  saml,
  trustedDevice,
  type AuditLogPrefix,
} from '@logto/schemas';
import { yes } from '@silverhand/essentials';
import { boolean, number, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';
import { parseTimestampParam, validateTimeWindow } from '#src/utils/time-window.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// `limit` bounds how many rows one call deletes. Each call is a single
// `delete ... where ctid = any(array(select ... limit N))` statement, so the bound is what keeps a
// call short: it stays clear of the pool's `statement_timeout`, holds few row locks at a time, and
// avoids producing a burst of dead tuples and WAL that would compete with normal request traffic.
// 1000 is a safe default for both interactive and scripted callers; 10000 is the ceiling for
// callers that would trade a longer call for fewer round trips.
const defaultDeleteLimit = 1000;
const maxDeleteLimit = 10_000;

/**
 * The audit log keys exposed by `GET /logs`. The delete endpoint reuses the exact same list, so
 * both endpoints operate on the same row set: whatever an export at a given time window returns is
 * what a delete at the same window removes.
 *
 * Webhook delivery logs (`TriggerHook.*`) share the `logs` table but are a separate surface, read
 * through `GET /hooks/:id/recent-logs`, and are deliberately excluded here — deleting them would
 * destroy rows this endpoint never shows and would skew the 24-hour hook execution stats that are
 * derived from the same table.
 */
const auditLogKeyPrefixes: AuditLogPrefix[] = [
  token.Type.ExchangeTokenBy,
  token.Type.RevokeToken,
  token.Type.RevokeGrants,
  interaction.prefix,
  jwtCustomizer.prefix,
  saml.prefix,
  action.prefix,
  trustedDevice.prefix,
  LogKeyUnknown,
];

const invalidInput = (type: string) => new RequestError({ code: 'guard.invalid_input', type });

/**
 * Parse an optional unix-millisecond boundary, rejecting inputs that `Number()` would silently
 * coerce into a valid-looking value.
 *
 * - `Number('')` and `Number('   ')` are both `0`, which would turn a bounded window into an
 *   unbounded one (an empty `start_time` drops the lower bound entirely).
 * - Values outside PostgreSQL's `timestamptz` range make `to_timestamp()` raise, which would
 *   surface as a `500` instead of a `400`.
 */
const parseBound = (raw: string | undefined, type: string): number | undefined => {
  if (raw === undefined) {
    return undefined;
  }

  if (raw.trim() === '') {
    throw invalidInput(type);
  }

  const value = parseTimestampParam(raw, type);

  assertThat(value !== undefined && Number.isSafeInteger(value) && value >= 0, invalidInput(type));

  return value;
};

export default function logRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { findLogById, countLogs, findLogs, deleteLogsInRange } = queries.logs;

  router.get(
    '/logs',
    koaPagination(),
    koaGuard({
      query: object({
        userId: string().optional(),
        applicationId: string().optional(),
        logKey: string().optional(),
        enableCap: string().optional(),
        start_time: string().optional(),
        end_time: string().optional(),
      }),
      response: logResponseGuard.array(),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { userId, applicationId, logKey, enableCap, start_time, end_time },
      } = ctx.guard;

      const startTime = parseTimestampParam(start_time, 'start_time');
      const endTime = parseTimestampParam(end_time, 'end_time');
      validateTimeWindow(startTime, endTime);

      const includeKeyPrefix = auditLogKeyPrefixes;

      // TODO: @Gao refactor like user search
      const [{ count, isCapped }, logs] = await Promise.all([
        countLogs(
          {
            logKey,
            payload: { applicationId, userId },
            startTime,
            endTime,
            includeKeyPrefix,
          },
          { capped: yes(enableCap) }
        ),
        findLogs(limit, offset, {
          logKey,
          payload: { userId, applicationId },
          startTime,
          endTime,
          includeKeyPrefix,
        }),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.pagination.totalCountIsCapped = isCapped;
      ctx.body = logs;

      return next();
    }
  );

  router.get(
    '/logs/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: logResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findLogById(id);

      return next();
    }
  );

  router.delete(
    '/logs',
    koaGuard({
      query: object({
        end_time: string(),
        start_time: string().optional(),
        limit: string().optional(),
      }),
      response: object({
        deletedCount: number(),
        hasMore: boolean(),
        deletedRange: object({ oldest: number(), newest: number() }).optional(),
      }),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { query } = ctx.guard;

      const endTime = parseBound(query.end_time, 'end_time');

      // `end_time` is required by the guard, so `parseBound` only returns `undefined` when the
      // parameter is absent; throw rather than falling back to a default window.
      if (endTime === undefined) {
        throw invalidInput('end_time');
      }

      const startTime = parseBound(query.start_time, 'start_time');

      const limit = query.limit === undefined ? defaultDeleteLimit : Number(query.limit);
      assertThat(
        Number.isInteger(limit) && limit >= 1 && limit <= maxDeleteLimit,
        invalidInput('limit')
      );

      // Same bound-ordering rule as `GET /logs`, reusing its error code so the two endpoints
      // reject the same window for the same reason.
      validateTimeWindow(startTime, endTime);

      // A boundary in the future is almost always a unit mistake — microseconds or nanoseconds
      // passed where milliseconds are expected — or a miscomputed timezone offset, and either
      // would turn a bounded delete into an unbounded one. (Passing seconds yields a boundary in
      // the past, which deletes nothing rather than too much.)
      assertThat(
        endTime <= Date.now(),
        new RequestError({ code: 'log.cleanup_boundary_in_future', status: 400 })
      );

      const { deletedCount, deletedRange } = await deleteLogsInRange({
        endTime,
        startTime,
        limit,
        includeKeyPrefix: auditLogKeyPrefixes,
      });

      ctx.body = {
        deletedCount,
        hasMore: deletedCount === limit,
        ...(deletedRange && { deletedRange }),
      };

      return next();
    }
  );
}
