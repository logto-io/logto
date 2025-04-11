import { SentinelActivityTargetType } from '@logto/schemas';
import { sha256 } from 'hash-wasm';
import { z } from 'zod';

import koaGuard from '../middleware/koa-guard.js';

import { type RouterInitArgs, type ManagementApiRouter } from './types.js';

export default function sentinelActivitiesRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  /**
   * We need to bulk delete the activities in the database based on a given list of target values (identifiers).
   * It is uncommon to use body parameters in a DELETE request.
   * Use the POST method instead for bulk deletion.
   */
  router.post(
    `/sentinel-activities/delete`,
    koaGuard({
      body: z.object({
        targetType: z.nativeEnum(SentinelActivityTargetType),
        targets: z.string().array(),
      }),
      status: [204],
    }),
    async (ctx, next) => {
      const {
        body: { targetType, targets },
      } = ctx.guard;

      const { sentinelActivities } = queries;

      const targetHashes = await Promise.all(targets.map(async (target) => sha256(target)));
      await sentinelActivities.deleteActivities(targetType, targetHashes);

      ctx.status = 204;

      return next();
    }
  );
}
