import { jsonObjectGuard } from '@logto/connector-kit';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function applicationCustomDataRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  router.patch(
    '/applications/:applicationId/custom-data',
    koaGuard({
      params: z.object({ applicationId: z.string() }),
      body: jsonObjectGuard,
      response: jsonObjectGuard,
    }),
    async (ctx, next) => {
      const { applicationId } = ctx.guard.params;
      const patchPayload = ctx.guard.body;

      const application = await queries.applications.updateApplicationById(applicationId, {
        customData: patchPayload,
      });

      ctx.body = application.customData;

      return next();
    }
  );
}
