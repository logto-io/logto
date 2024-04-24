import { Logs, interaction, token, LogKeyUnknown } from '@logto/schemas';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { type AllowedKeyPrefix } from '#src/queries/log.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function logRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { findLogById, countLogs, findLogs } = queries.logs;

  router.get(
    '/logs',
    koaPagination(),
    koaGuard({
      query: object({
        userId: string().optional(),
        applicationId: string().optional(),
        logKey: string().optional(),
      }),
      response: Logs.guard.array(),
      status: 200,
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { userId, applicationId, logKey },
      } = ctx.guard;

      const includeKeyPrefix: AllowedKeyPrefix[] = [
        token.Type.ExchangeTokenBy,
        token.Type.RevokeToken,
        interaction.prefix,
        LogKeyUnknown,
      ];

      // TODO: @Gao refactor like user search
      const [{ count }, logs] = await Promise.all([
        countLogs({
          logKey,
          payload: { applicationId, userId },
          includeKeyPrefix,
        }),
        findLogs(limit, offset, {
          logKey,
          payload: { userId, applicationId },
          includeKeyPrefix,
        }),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.body = logs;

      return next();
    }
  );

  router.get(
    '/logs/:id',
    koaGuard({ params: object({ id: string().min(1) }), response: Logs.guard, status: [200, 404] }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findLogById(id);

      return next();
    }
  );
}
