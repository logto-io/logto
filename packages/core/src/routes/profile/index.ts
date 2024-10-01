import { usernameRegEx, UserScope } from '@logto/core-kit';
import { userProfileGuard, userProfileResponseGuard } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
import { encryptUserPassword } from '../../libraries/user.utils.js';
import { buildUserVerificationRecordById } from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { getScopedProfile } from './utils/get-scoped-profile.js';

export default function profileRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById },
  } = queries;

  const {
    users: { checkIdentifierCollision },
  } = libraries;

  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.get(
    '/profile',
    koaGuard({
      response: userProfileResponseGuard.partial(),
      status: [200],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      ctx.body = await getScopedProfile(queries, libraries, scopes, userId);
      return next();
    }
  );

  router.patch(
    '/profile',
    koaGuard({
      body: z.object({
        name: z.string().nullable().optional(),
        avatar: z.string().url().nullable().optional(),
        username: z.string().regex(usernameRegEx).optional(),
        profile: userProfileGuard.optional(),
      }),
      response: userProfileResponseGuard.partial(),
      status: [200, 400, 422],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { body } = ctx.guard;
      const { name, avatar, username, profile } = body;
      const { address, ...restProfile } = profile ?? {};

      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');

      if (username !== undefined) {
        await checkIdentifierCollision({ username }, userId);
      }

      const updatedUser = await updateUserById(userId, {
        name,
        avatar,
        username,
        ...conditional(
          profile && {
            profile: {
              ...restProfile,
              // Remove address from profile if user does not have the address scope
              ...conditional(scopes.has(UserScope.Address) && { address }),
            },
          }
        ),
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.body = await getScopedProfile(queries, libraries, scopes, userId);

      return next();
    }
  );

  router.post(
    '/profile/password',
    koaGuard({
      body: z.object({ password: z.string().min(1), verificationRecordId: z.string() }),
      status: [204, 400],
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password, verificationRecordId } = ctx.guard.body;

      // TODO(LOG-9947): apply password policy

      const verificationRecord = await buildUserVerificationRecordById(
        userId,
        verificationRecordId,
        queries,
        libraries
      );
      assertThat(verificationRecord.isVerified, 'verification_record.not_found');

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      const updatedUser = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
