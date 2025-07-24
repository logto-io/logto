import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function secretsRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { secrets: secretsQuery } = queries;

  router.delete(
    '/secrets/:id',
    koaGuard({
      params: z.object({ id: z.string() }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await secretsQuery.deleteById(id);
      ctx.status = 204;
      return next();
    }
  );
}
