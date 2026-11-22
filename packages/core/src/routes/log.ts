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
  type LogResponse,
} from '@logto/schemas';
import { conditional, yes } from '@silverhand/essentials';
import { boolean, number, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type { LogExportRow } from '#src/queries/log.js';
import assertThat from '#src/utils/assert-that.js';
import { decodeLogExportCursor, encodeLogExportCursor } from '#src/utils/log-export.js';
import { parseTimestampParam, validateTimeWindow } from '#src/utils/time-window.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// `limit` bounds the page size for delete batches and export pages. The default keeps interactive
// calls small, and the ceiling caps the work one request can do. Export reads one extra row only
// to detect whether another page exists. For delete, each call is a single
// `delete ... where ctid = any(array(select ... limit N))` statement, so the bound also keeps a
// call clear of the pool's `statement_timeout` and avoids a burst of dead tuples/WAL.
const defaultLogBatchLimit = 1000;
const maxLogBatchLimit = 10_000;

/**
 * The audit log keys exposed by `GET /logs`.
 *
 * Webhook delivery logs (`TriggerHook.*`) share the `logs` table but are a separate surface, read
 * through `GET /hooks/:id/recent-logs`, so they are excluded from this list. Note that
 * `DELETE /logs` deliberately does *not* apply this list: it purges every log row in the window,
 * webhook delivery logs included, which is what lets it use the time index and reclaim their
 * space.
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

// Drop the internal cursor timestamp before returning the public log shape.
const toLogResponse = (log: LogExportRow): LogResponse => ({
  tenantId: log.tenantId,
  id: log.id,
  key: log.key,
  payload: log.payload,
  createdAt: log.createdAt,
});

export default function logRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { findLogById, countLogs, findLogs, findLogsForExport, deleteLogsInRange } = queries.logs;

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
    '/logs/export',
    koaGuard({
      query: object({
        excludeWebhookLogs: string().optional(),
        cursor: string().max(512).optional(),
        limit: string().optional(),
        end_time: string(),
        start_time: string().optional(),
      }),
      response: object({
        items: logResponseGuard.array(),
        nextCursor: string().optional(),
      }),
      status: [200, 400],
    }),
    async (ctx) => {
      const {
        query: { excludeWebhookLogs, cursor: rawCursor, limit: rawLimit },
      } = ctx.guard;

      const endTime = parseBound(ctx.guard.query.end_time, 'end_time');

      // `end_time` is required by the guard, so `parseBound` only returns `undefined` when the
      // parameter is absent; throw rather than reading an unbounded range by accident.
      if (endTime === undefined) {
        throw invalidInput('end_time');
      }

      const startTime = parseBound(ctx.guard.query.start_time, 'start_time');

      // The export uses the same inclusive window semantics as `GET /logs` and `DELETE /logs`.
      // Like `DELETE /logs`, it also rejects a future `end_time` because that is usually a unit
      // mistake.
      validateTimeWindow(startTime, endTime);
      assertThat(
        endTime <= Date.now(),
        new RequestError({ code: 'log.cleanup_boundary_in_future', status: 400 })
      );

      const limit = rawLimit === undefined ? defaultLogBatchLimit : Number(rawLimit);
      assertThat(
        Number.isInteger(limit) && limit >= 1 && limit <= maxLogBatchLimit,
        invalidInput('limit')
      );

      const cursor = decodeLogExportCursor(rawCursor);

      // Read one extra row so a page that is exactly full is still reported as the last page.
      // `nextCursor` is set only when that extra row exists. It is the exact PostgreSQL timestamp
      // plus the id, so rows that share a millisecond can cross a page boundary without being
      // duplicated or skipped.
      const rows = await findLogsForExport(limit + 1, {
        startTime,
        endTime,
        // By default, include webhook delivery logs so the export matches the key scope of
        // `DELETE /logs`. With `excludeWebhookLogs`, the export is audit-only and is not a
        // complete archive. The cursor only tracks read progress; deleting by the same time
        // window is only safe after the window stops changing.
        includeKeyPrefix: conditional(yes(excludeWebhookLogs) && auditLogKeyPrefixes),
        after: cursor,
      });

      const items = rows.length > limit ? rows.slice(0, limit) : rows;
      const lastItem = items.at(-1);
      const nextCursor =
        rows.length > limit && lastItem
          ? encodeLogExportCursor({
              createdAt: lastItem.createdAtCursor,
              id: lastItem.id,
            })
          : undefined;

      ctx.set('Cache-Control', 'no-store');
      ctx.body = {
        items: items.map((item) => toLogResponse(item)),
        ...conditional(nextCursor && { nextCursor }),
      };

      // Do not call `next()`: `GET /logs/:id` also matches this path, and continuing would let
      // that handler overwrite the batch response with a log lookup.
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

      const limit = query.limit === undefined ? defaultLogBatchLimit : Number(query.limit);
      assertThat(
        Number.isInteger(limit) && limit >= 1 && limit <= maxLogBatchLimit,
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
