import { emailRegEx } from '@logto/core-kit';
import {
  type OneTimeTokenContext,
  OneTimeTokens,
  oneTimeTokenContextGuard,
  oneTimeTokenStatusGuard,
  RoleType,
} from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { cond, trySafe } from '@silverhand/essentials';
import { addSeconds } from 'date-fns';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { assertNotReadOnly } from '#src/middleware/koa-read-only-access.js';
import assertThat from '#src/utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// Default expiration time: 10 minutes.
const defaultExpiresTime = 10 * 60;

// Dev feature: organization roles of one-time token JIT provisioning.
const creationContextGuard: z.ZodType<OneTimeTokenContext> = EnvSet.values.isDevFeaturesEnabled
  ? oneTimeTokenContextGuard
  : oneTimeTokenContextGuard.omit({ jitOrganizationRoleIds: true });

export default function oneTimeTokenRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries: {
        oneTimeTokens: {
          deleteOneTimeTokenById,
          countOneTimeTokens,
          insertOneTimeToken,
          updateExpiredOneTimeTokensStatusByEmail,
          getOneTimeTokens,
          getOneTimeTokenById,
        },
        organizations,
      },
      libraries: {
        oneTimeTokens: { verifyOneTimeToken, updateOneTimeTokenStatusById },
      },
    },
  ]: RouterInitArgs<T>
) {
  /**
   * Reject the organization roles that can never be assigned when the token is used, so the caller
   * learns about them now instead of the user being signed in with fewer roles than intended.
   */
  const assertJitOrganizationRoles = async ({
    jitOrganizationIds,
    jitOrganizationRoleIds = [],
  }: OneTimeTokenContext = {}) => {
    if (jitOrganizationRoleIds.length === 0) {
      return;
    }

    assertThat(
      jitOrganizationIds?.length,
      new RequestError({
        code: 'request.invalid_input',
        details: 'The value of `jitOrganizationRoleIds` requires `jitOrganizationIds`.',
      })
    );

    const roles = await organizations.roles.findByIds(jitOrganizationRoleIds);
    const userRoleIds = new Set(
      roles.filter(({ type }) => type === RoleType.User).map(({ id }) => id)
    );
    const invalidRoleIds = jitOrganizationRoleIds.filter((id) => !userRoleIds.has(id));

    assertThat(
      invalidRoleIds.length === 0,
      new RequestError({
        code: 'request.invalid_input',
        details: `The following values of \`jitOrganizationRoleIds\` are not organization roles for users: ${invalidRoleIds.join(', ')}.`,
      })
    );
  };

  router.get(
    '/one-time-tokens',
    koaPagination({ isOptional: true }),
    koaGuard({
      query: z.object({
        email: z.string().regex(emailRegEx).optional(),
        status: oneTimeTokenStatusGuard.optional(),
      }),
      response: z.array(OneTimeTokens.guard),
      status: [200, 400, 403],
    }),
    async (ctx, next) => {
      assertNotReadOnly(ctx.auth);
      const { guard, pagination } = ctx;
      const { email, status } = guard.query;
      const { disabled: isPaginationDisabled } = pagination;

      const [{ count }, oneTimeTokens] = await Promise.all([
        countOneTimeTokens({ email, status }),
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
      status: [200, 400, 403, 404],
    }),
    async (ctx, next) => {
      assertNotReadOnly(ctx.auth);
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
      body: OneTimeTokens.createGuard.pick({ email: true }).merge(
        z.object({
          context: creationContextGuard.optional(),
          // Expiration time in seconds.
          expiresIn: z.number().min(1).optional(),
        })
      ),
      response: OneTimeTokens.guard,
      status: [201, 400],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { expiresIn, ...rest } = body;

      await assertJitOrganizationRoles(rest.context);

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

      // Management API is an admin-level raw token verifier and does not bind the token to an Experience interaction.
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
      status: [204, 400, 404],
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
