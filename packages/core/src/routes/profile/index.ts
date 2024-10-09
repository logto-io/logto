import { emailRegEx, usernameRegEx, UserScope } from '@logto/core-kit';
import { VerificationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
import { encryptUserPassword } from '../../libraries/user.utils.js';
import {
  buildVerificationRecordByIdAndType,
  verifyUserSensitivePermission,
} from '../../libraries/verification.js';
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
      status: [204, 400, 403],
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password, verificationRecordId } = ctx.guard.body;

      const user = await findUserById(userId);
      const signInExperience = await findDefaultSignInExperience();
      const passwordPolicyChecker = new PasswordValidator(signInExperience.passwordPolicy, user);
      await passwordPolicyChecker.validatePassword(password, user);

      await verifyUserSensitivePermission({
        userId,
        id: verificationRecordId,
        queries,
        libraries,
      });

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

  router.post(
    '/profile/primary-email',
    koaGuard({
      body: z.object({
        email: z.string().regex(emailRegEx),
        verificationRecordId: z.string(),
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 403],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { email, verificationRecordId, newIdentifierVerificationRecordId } = ctx.guard.body;

      assertThat(scopes.has(UserScope.Email), 'auth.unauthorized');

      await verifyUserSensitivePermission({
        userId,
        id: verificationRecordId,
        queries,
        libraries,
      });

      // Check new identifier
      const newVerificationRecord = await buildVerificationRecordByIdAndType({
        type: VerificationType.EmailVerificationCode,
        id: newIdentifierVerificationRecordId,
        queries,
        libraries,
      });
      assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');
      assertThat(newVerificationRecord.identifier.value === email, 'verification_record.not_found');

      await checkIdentifierCollision({ primaryEmail: email }, userId);

      const updatedUser = await updateUserById(userId, { primaryEmail: email });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
