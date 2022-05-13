import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import { countUserLogs, findUserLogs } from '@/queries/log';

import { AuthedRouter } from './types';

export default function logRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/users/:userId/logs',
    koaPagination(),
    koaGuard({
      params: object({ userId: string() }),
      query: object({
        applicationId: string().optional(),
        logType: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        params: { userId },
        query: { applicationId, logType },
      } = ctx.guard;

      const [{ count }, userLogs] = await Promise.all([
        countUserLogs({ userId, applicationId, logType }),
        findUserLogs(limit, offset, { userId, applicationId, logType }),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.body = userLogs;

      return next();
    }
  );
}
