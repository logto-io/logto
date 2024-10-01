import { usernameRegEx, UserScope } from '@logto/core-kit';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
import { encryptUserPassword } from '../../libraries/user.utils.js';
import { buildUserVerificationRecordById } from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import { PasswordValidator } from '../experience/classes/libraries/password-validator.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

export default function profileRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById, findUserById },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  const {
    users: { checkIdentifierCollision },
  } = libraries;

  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.patch(
    '/profile',
    koaGuard({
      body: z.object({
        name: z.string().nullable().optional(),
        avatar: z.string().url().nullable().optional(),
        username: z.string().regex(usernameRegEx).optional(),
      }),
      response: z.object({
        name: z.string().nullable().optional(),
        avatar: z.string().nullable().optional(),
        username: z.string().optional(),
      }),
      status: [200, 400, 422],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { body } = ctx.guard;
      const { name, avatar, username } = body;

      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');

      if (username !== undefined) {
        await checkIdentifierCollision({ username }, userId);
      }

      const updatedUser = await updateUserById(userId, { name, avatar, username });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      // Only return the fields that were actually updated
      ctx.body = {
        ...conditional(name !== undefined && { name: updatedUser.name }),
        ...conditional(avatar !== undefined && { avatar: updatedUser.avatar }),
        ...conditional(username !== undefined && { username: updatedUser.username }),
      };

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

      const user = await findUserById(userId);
      const signInExperience = await findDefaultSignInExperience();
      const passwordPolicyChecker = new PasswordValidator(signInExperience.passwordPolicy, user);
      await passwordPolicyChecker.validatePassword(password, user);

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
