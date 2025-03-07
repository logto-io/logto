import { OneTimeTokens } from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import { addSeconds } from 'date-fns';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// Default expiration time: 10 minutes.
const defaultExpiresTime = 10 * 60;

export default function oneTimeTokenRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries: {
        oneTimeTokens: { insertOneTimeToken, updateExpiredOneTimeTokensStatusByEmail },
      },
      libraries: {
        oneTimeTokens: { verifyOneTimeToken },
      },
    },
  ]: RouterInitArgs<T>
) {
  router.post(
    '/one-time-tokens',
    koaGuard({
      body: OneTimeTokens.createGuard
        .pick({ email: true, context: true })
        .partial({
          context: true,
        })
        .merge(
          z.object({
            // Expiration time in seconds.
            expiresIn: z.number().min(1).optional(),
          })
        ),
      response: OneTimeTokens.guard,
      status: [201],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { expiresIn, ...rest } = body;

      // TODO: add an integration test for this, once GET API is added.
      void trySafe(async () => updateExpiredOneTimeTokensStatusByEmail(rest.email));

      const expiresAt = addSeconds(new Date(), expiresIn ?? defaultExpiresTime);
      const oneTimeToken = await insertOneTimeToken({
        ...rest,
        id: generateStandardId(),
        // TODO: export generate random string with specified length from @logto/shared.
        token: generateStandardSecret(),
        expiresAt: expiresAt.getTime(),
      });

      ctx.status = 201;
      ctx.body = oneTimeToken;
      return next();
    }
  );

  router.post(
    '/one-time-tokens/verify',
    koaGuard({
      body: OneTimeTokens.guard.pick({
        token: true,
        email: true,
      }),
      response: OneTimeTokens.guard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { token, email } = ctx.guard.body;

      ctx.body = await verifyOneTimeToken(token, email);
      ctx.status = 200;
      return next();
    }
  );
}
