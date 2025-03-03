import { OneTimeTokens, oneTimeTokenContextGuard } from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import { addSeconds } from 'date-fns';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// Default expiration time: 2 days.
// Both Cloudflare and Spotify are using this value.
const defaultExpiresTime = 2 * 24 * 60 * 60;

export default function oneTimeTokenRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries: {
        oneTimeTokens: { insertOneTimeToken, updateExpiredOneTimeTokensStatus },
      },
    },
  ]: RouterInitArgs<T>
) {
  router.post(
    '/one-time-tokens',
    koaGuard({
      body: OneTimeTokens.createGuard
        .pick({ email: true })
        .merge(
          z.object({
            // Expiration time in seconds.
            expiresIn: z.number().min(1).optional(),
          })
        )
        .merge(oneTimeTokenContextGuard),
      response: OneTimeTokens.guard,
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { email, expiresIn, ...context } = body;

      await trySafe(async () => updateExpiredOneTimeTokensStatus(email));

      const expiresAt = addSeconds(new Date(), expiresIn ?? defaultExpiresTime);
      const oneTimeToken = await insertOneTimeToken({
        id: generateStandardId(),
        email,
        // TODO: export generate random string with specified length from @logto/shared.
        token: generateStandardSecret(),
        expiresAt: expiresAt.getTime(),
        context,
      });

      ctx.status = 201;
      ctx.body = oneTimeToken;
      return next();
    }
  );
}
