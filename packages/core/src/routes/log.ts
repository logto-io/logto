import { Logs } from '@logto/schemas';
import { yes } from '@silverhand/essentials';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function logRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { countLogs, findLogById, findLogs } = queries.logs;

  router.get(
    '/logs',
    koaPagination(),
    koaGuard({
      query: object({
        userId: string().optional(),
        applicationId: string().optional(),
        logKey: string().optional(),
        includeWebhookLogs: string().optional(),
      }),
      response: Logs.guard.omit({ tenantId: true }).array(),
      status: 200,
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { userId, applicationId, logKey, includeWebhookLogs: includeWebhookLogsString },
      } = ctx.guard;
      const includeWebhookLogs = yes(includeWebhookLogsString);

      // TODO: @Gao refactor like user search
      // Filter out webhook logs from the audit log list by default.
      const [{ count }, logs] = await Promise.all([
        countLogs({
          logKey,
          applicationId,
          userId,
          includeWebhookLogs,
        }),
        findLogs(limit, offset, {
          logKey,
          userId,
          applicationId,
          includeWebhookLogs,
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
