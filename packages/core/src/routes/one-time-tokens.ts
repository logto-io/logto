import { emailRegEx } from '@logto/core-kit';
import { OneTimeTokens, oneTimeTokenStatusGuard } from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { cond, trySafe } from '@silverhand/essentials';
import { addSeconds } from 'date-fns';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// Default expiration time: 10 minutes.
const defaultExpiresTime = 10 * 60;

export default function oneTimeTokenRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries: {
        oneTimeTokens: {
          deleteOneTimeTokenById,
          findTotalNumberOfOneTimeTokens,
          insertOneTimeToken,
          updateExpiredOneTimeTokensStatusByEmail,
          getOneTimeTokens,
          getOneTimeTokenById,
        },
      },
      libraries: {
        oneTimeTokens: { verifyOneTimeToken, updateOneTimeTokenStatusById },
      },
    },
  ]: RouterInitArgs<T>
) {
  router.get(
    '/one-time-tokens',
    koaPagination({ isOptional: true }),
    koaGuard({
      query: z.object({
        email: z.string().regex(emailRegEx).optional(),
        status: oneTimeTokenStatusGuard.optional(),
      }),
      response: z.array(OneTimeTokens.guard),
      status: 200,
    }),
    async (ctx, next) => {
      const { guard, pagination } = ctx;
      const { email, status } = guard.query;
      const { disabled: isPaginationDisabled } = pagination;

      const [{ count }, oneTimeTokens] = await Promise.all([
        findTotalNumberOfOneTimeTokens(),
        getOneTimeTokens({ email, status }, cond(!isPaginationDisabled && pagination)),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = oneTimeTokens;
      ctx.status = 200;
      return next();
    }
  );

  router.get(
    '/one-time-tokens/:id',
    koaGuard({
      params: z.object({
        id: z.string().min(1),
      }),
      response: OneTimeTokens.guard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { params } = ctx.guard;
      const { id } = params;

      const oneTimeToken = await getOneTimeTokenById(id);
      ctx.body = oneTimeToken;
      ctx.status = 200;
      return next();
    }
  );
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

  router.put(
    '/one-time-tokens/:id/status',
    koaGuard({
      params: z.object({
        id: z.string().min(1),
      }),
      body: z.object({
        status: oneTimeTokenStatusGuard,
      }),
      response: OneTimeTokens.guard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { params, body } = ctx.guard;
      const { id } = params;
      const { status } = body;

      const oneTimeToken = await updateOneTimeTokenStatusById(id, status);
      ctx.body = oneTimeToken;
      ctx.status = 200;
      return next();
    }
  );

  router.delete(
    '/one-time-tokens/:id',
    koaGuard({
      params: z.object({
        id: z.string().min(1),
      }),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { params } = ctx.guard;
      const { id } = params;

      await deleteOneTimeTokenById(id);
      ctx.status = 204;
      return next();
    }
  );
}
