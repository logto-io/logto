import { OneTimeTokenStatus, OneTimeTokens, oneTimeTokenContextGuard } from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import { addSeconds } from 'date-fns';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// Default expiration time: 2 days.
// Both Cloudflare and Spotify are using this value.
const defaultExpiresTime = 2 * 24 * 60 * 60;

export default function oneTimeTokenRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries: {
        oneTimeTokens: {
          insertOneTimeToken,
          updateExpiredOneTimeTokensStatus,
          findActiveOneTimeTokenByEmailAndToken,
        },
      },
      libraries: {
        oneTimeTokens: { updateOneTimeTokenStatus },
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
      const oneTimeToken = await findActiveOneTimeTokenByEmailAndToken(email, token);

      assertThat(
        oneTimeToken,
        new RequestError({ code: 'one_time_token.active_token_not_found', status: 404 })
      );

      // No need to check if the token's status is `active` since we get the token from the database and status to be `active` is one of the searching criteria.
      if (oneTimeToken.expiresAt <= Date.now()) {
        await updateOneTimeTokenStatus(email, token, OneTimeTokenStatus.Expired);
        throw new RequestError('one_time_token.token_expired');
      }

      const consumedOneTimeToken = await updateOneTimeTokenStatus(
        email,
        token,
        OneTimeTokenStatus.Consumed
      );

      ctx.body = consumedOneTimeToken;
      ctx.status = 200;
      return next();
    }
  );
}
