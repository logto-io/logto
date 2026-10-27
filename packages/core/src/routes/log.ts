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

const defaultDeleteLimit = 1000;
const maxDeleteLimit = 10_000;

export default function logRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { findLogById, countLogs, findLogs, deleteLogsBefore } = queries.logs;

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

      const includeKeyPrefix: AuditLogPrefix[] = [
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
        before: string(),
        after: string().optional(),
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

      const before = parseTimestampParam(query.before, 'before');

      // `before` is required by the guard, but `parseTimestampParam` still returns
      // `number | undefined`; throw explicitly rather than relying on truthiness, because a
      // legitimate `before=0` (the unix epoch) is falsy.
      if (before === undefined) {
        throw new RequestError({ code: 'guard.invalid_input', type: 'before' });
      }

      const after = parseTimestampParam(query.after, 'after');

      const limit = query.limit === undefined ? defaultDeleteLimit : Number(query.limit);
      assertThat(
        Number.isInteger(limit) && limit >= 1 && limit <= maxDeleteLimit,
        new RequestError({ code: 'guard.invalid_input', type: 'limit' })
      );

      // A boundary in the future is almost always a unit or timezone mistake, and would turn a
      // bounded delete into an unbounded one. See the design spec §4.2.
      assertThat(
        before <= Date.now(),
        new RequestError({ code: 'log.cleanup_boundary_in_future', status: 400 })
      );

      if (after !== undefined) {
        assertThat(
          after < before,
          new RequestError({ code: 'log.cleanup_invalid_bounds', status: 400 })
        );
      }

      const { deletedCount, deletedRange } = await deleteLogsBefore({ before, after, limit });

      ctx.body = {
        deletedCount,
        hasMore: deletedCount === limit,
        ...(deletedRange && { deletedRange }),
      };

      return next();
    }
  );
}
