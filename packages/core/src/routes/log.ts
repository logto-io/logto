import { Logs } from '@logto/schemas';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { countLogs, findLogById, findLogs } from '#src/queries/log.js';

import type { AuthedRouter } from './types.js';

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

      // TODO: @Gao refactor like user search
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

  router.get(
    '/logs/:id',
    koaGuard({ params: object({ id: string().min(1) }), response: Logs.guard }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findLogById(id);

      return next();
    }
  );
}
