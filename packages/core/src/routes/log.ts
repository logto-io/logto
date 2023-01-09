import { Logs } from '@logto/schemas';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { countLogs, findLogById, findLogs } from '#src/queries/log.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function logRoutes<T extends AuthedRouter>(...[router]: RouterInitArgs<T>) {
  router.get(
    '/logs',
    koaPagination(),
    koaGuard({
      query: object({
        userId: string().optional(),
        applicationId: string().optional(),
        logKey: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { userId, applicationId, logKey },
      } = ctx.guard;

      // TODO: @Gao refactor like user search
      const [{ count }, logs] = await Promise.all([
        countLogs({ logKey, applicationId, userId }),
        findLogs(limit, offset, { logKey, userId, applicationId }),
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
