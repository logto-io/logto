import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function usernamePolicyRoutes<T extends ManagementApiRouter>(
  ...[router, { libraries }]: RouterInitArgs<T>
) {
  const { findCaseConflicts } = libraries.signInExperiences;

  /**
   * Diagnostic endpoint for the console: reports usernames that would collide under a
   * case-insensitive policy, so an operator can resolve them before flipping `caseSensitive` off
   * (a flip that would otherwise be rejected with 409 on PATCH `/sign-in-exp`).
   */
  router.get(
    '/sign-in-exp/username-policy/case-sensitivity-conflicts',
    koaGuard({
      query: z.object({ limit: z.coerce.number().int().min(1).max(100).default(20) }),
      response: z.object({
        totalConflicts: z.number().int().min(0),
        samples: z.object({ usernameLower: z.string(), userIds: z.string().array() }).array(),
      }),
      status: [200],
    }),
    async (ctx, next) => {
      const { limit } = ctx.guard.query;
      ctx.body = await findCaseConflicts(limit);
      return next();
    }
  );
}
