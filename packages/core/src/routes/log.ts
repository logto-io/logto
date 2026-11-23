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
import { yes } from '@silverhand/essentials';
import { boolean, number, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type { LogCursorRow } from '#src/queries/log.js';
import assertThat from '#src/utils/assert-that.js';
import { decodeLogCursor, encodeLogCursor } from '#src/utils/log-cursor.js';
import { parseTimestampParam, validateTimeWindow } from '#src/utils/time-window.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// `limit` bounds how many rows one delete call processes. Each call is a single
// `delete ... where ctid = any(array(select ... limit N))` statement, so the bound keeps a call
// clear of the pool's `statement_timeout` and avoids a burst of dead tuples/WAL.
const defaultDeleteLimit = 1000;
const maxDeleteLimit = 10_000;

// Cursor mode on `GET /logs` uses a smaller page than delete batches because it is exposed to
// shared Logto Cloud instances.
const defaultLogCursorLimit = 500;
const maxLogCursorLimit = 1000;

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
const toLogResponse = (log: LogCursorRow): LogResponse => ({
  tenantId: log.tenantId,
  id: log.id,
  key: log.key,
  payload: log.payload,
  createdAt: log.createdAt,
});

export default function logRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { findLogById, countLogs, findLogs, findLogsForCursor, deleteLogsInRange } = queries.logs;

  router.get(
    '/logs',
    koaPagination({
      skip: (context) => context.request.query.pagination === 'cursor',
    }),
    koaGuard({
      query: object({
        userId: string().optional(),
        applicationId: string().optional(),
        logKey: string().optional(),
        enableCap: string().optional(),
        pagination: string().optional(),
        cursor: string().max(512).optional(),
        limit: string().optional(),
        start_time: string().optional(),
        end_time: string().optional(),
      }),
      response: logResponseGuard.array(),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const {
        query: {
          userId,
          applicationId,
          logKey,
          enableCap,
          pagination,
          cursor: rawCursor,
          limit: rawLimit,
          start_time,
          end_time,
        },
      } = ctx.guard;

      const cursorMode = pagination === 'cursor';
      assertThat(pagination === undefined || cursorMode, invalidInput('pagination'));

      if (cursorMode) {
        assertThat(!('page' in ctx.request.query), invalidInput('page'));
        assertThat(!('page_size' in ctx.request.query), invalidInput('page_size'));
        assertThat(enableCap === undefined, invalidInput('enableCap'));
        assertThat(userId === undefined, invalidInput('userId'));
        assertThat(applicationId === undefined, invalidInput('applicationId'));
        assertThat(logKey === undefined, invalidInput('logKey'));

        const cursorEndTime = parseBound(end_time, 'end_time');

        if (cursorEndTime === undefined) {
          throw invalidInput('end_time');
        }

        const cursorStartTime = parseBound(start_time, 'start_time');
        validateTimeWindow(cursorStartTime, cursorEndTime);
        assertThat(
          cursorEndTime <= Date.now(),
          new RequestError({ code: 'log.cleanup_boundary_in_future', status: 400 })
        );

        const cursorLimit = rawLimit === undefined ? defaultLogCursorLimit : Number(rawLimit);
        assertThat(
          Number.isInteger(cursorLimit) && cursorLimit >= 1 && cursorLimit <= maxLogCursorLimit,
          invalidInput('limit')
        );

        const cursor = decodeLogCursor(rawCursor);

        // Read one extra row so an exactly full page is distinguishable from the last page.
        // Cursor mode is audit-only and deliberately does not run the page-mode count query.
        const rows = await findLogsForCursor(cursorLimit + 1, {
          startTime: cursorStartTime,
          endTime: cursorEndTime,
          includeKeyPrefix: auditLogKeyPrefixes,
          after: cursor,
        });

        const items = rows.length > cursorLimit ? rows.slice(0, cursorLimit) : rows;
        const lastItem = items.at(-1);
        const nextCursor =
          rows.length > cursorLimit && lastItem
            ? encodeLogCursor({
                createdAt: lastItem.createdAtCursor,
                id: lastItem.id,
              })
            : undefined;

        ctx.body = items.map((item) => toLogResponse(item));

        if (nextCursor) {
          ctx.set('Next-Cursor', nextCursor);
        }

        return next();
      }

      assertThat(rawCursor === undefined, invalidInput('cursor'));
      assertThat(rawLimit === undefined, invalidInput('limit'));

      const { limit, offset } = ctx.pagination;
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
