import { SentinelActivityTargetType } from '@logto/schemas';
import { sha256 } from 'hash-wasm';
import { z } from 'zod';

import koaGuard from '../middleware/koa-guard.js';

import {
  canFoldLockoutTargetCase,
  getLockoutTargetCandidates,
} from './experience/classes/libraries/sentinel-guard.js';
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

      // Admins type identifiers by hand, so also clear the other spellings of what they entered
      // rather than that spelling alone — but only those that cannot belong to another account.
      const candidates = await Promise.all(
        targets.map(async (target) =>
          getLockoutTargetCandidates(target, await canFoldLockoutTargetCase(queries, target))
        )
      );
      const targetHashes = await Promise.all(
        candidates.flat().map(async (candidate) => sha256(candidate))
      );
      await sentinelActivities.deleteActivities(targetType, targetHashes);

      ctx.status = 204;

      return next();
    }
  );
}
