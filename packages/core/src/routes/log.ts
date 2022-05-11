import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import { countLogs, findLogs } from '@/queries/log';

import { AuthedRouter } from './types';

export default function logRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/logs',
    koaPagination(),
    koaGuard({
      query: object({
        userId: string().optional(),
        applicationId: string().optional(),
        logType: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { userId, applicationId, logType },
      } = ctx.guard;

      const [{ count }, logs] = await Promise.all([
        countLogs({ logType, applicationId, userId }),
        findLogs(limit, offset, { logType, userId, applicationId }),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.body = logs;

      return next();
    }
  );
}
