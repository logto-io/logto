/* eslint-disable max-lines */
import { emailRegEx, phoneRegEx, usernameRegEx, UserScope } from '@logto/core-kit';
import {
  VerificationType,
  userProfileResponseGuard,
  userProfileGuard,
  AccountCenterControlValue,
} from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
import RequestError from '../../errors/RequestError/index.js';
import { encryptUserPassword } from '../../libraries/user.utils.js';
import { buildVerificationRecordByIdAndType } from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import { PasswordValidator } from '../experience/classes/libraries/password-validator.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import koaAccountCenter from './middlewares/koa-account-center.js';
import { getAccountCenterFilteredProfile, getScopedProfile } from './utils/get-scoped-profile.js';

export default function profileRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById, findUserById, deleteUserIdentity },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  const {
    users: { checkIdentifierCollision },
  } = libraries;

  router.use(koaAccountCenter(queries));

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
      const profile = await getScopedProfile(queries, libraries, scopes, userId);
      ctx.body = getAccountCenterFilteredProfile(profile, ctx.accountCenter);
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
      }),
      response: userProfileResponseGuard.partial(),
      status: [200, 400, 422],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { body } = ctx.guard;
      const { name, avatar, username } = body;
      const { fields } = ctx.accountCenter;

      assertThat(
        name === undefined || fields.name === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );
      assertThat(
        avatar === undefined || fields.avatar === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );
      assertThat(
        username === undefined || fields.username === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );
      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');

      if (username !== undefined) {
        await checkIdentifierCollision({ username }, userId);
      }

      const updatedUser = await updateUserById(userId, {
        name,
        avatar,
        username,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      const profile = await getScopedProfile(queries, libraries, scopes, userId);
      ctx.body = getAccountCenterFilteredProfile(profile, ctx.accountCenter);

      return next();
    }
  );

  router.patch(
    '/profile/profile',
    koaGuard({
      body: userProfileGuard,
      response: userProfileGuard,
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { body } = ctx.guard;
      const { fields } = ctx.accountCenter;

      assertThat(
        fields.profile === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );
      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');

      if (body.address !== undefined) {
        assertThat(scopes.has(UserScope.Address), 'auth.unauthorized');
      }

      const updatedUser = await updateUserById(userId, {
        profile: body,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      const profile = await getScopedProfile(queries, libraries, scopes, userId);
      ctx.body = profile.profile;

      return next();
    }
  );

  router.post(
    '/profile/password',
    koaGuard({
      body: z.object({ password: z.string().min(1) }),
      status: [204, 400, 401, 422],
    }),
    async (ctx, next) => {
      const { id: userId, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { password } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.password === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );

      const user = await findUserById(userId);
      const signInExperience = await findDefaultSignInExperience();
      const passwordPolicyChecker = new PasswordValidator(signInExperience.passwordPolicy, user);
      await passwordPolicyChecker.validatePassword(password, user);

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
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { email, newIdentifierVerificationRecordId } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.email === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );

      assertThat(scopes.has(UserScope.Email), 'auth.unauthorized');

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

  router.post(
    '/profile/primary-phone',
    koaGuard({
      body: z.object({
        phone: z.string().regex(phoneRegEx),
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { phone, newIdentifierVerificationRecordId } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.phone === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );

      assertThat(scopes.has(UserScope.Phone), 'auth.unauthorized');

      // Check new identifier
      const newVerificationRecord = await buildVerificationRecordByIdAndType({
        type: VerificationType.PhoneVerificationCode,
        id: newIdentifierVerificationRecordId,
        queries,
        libraries,
      });
      assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');
      assertThat(newVerificationRecord.identifier.value === phone, 'verification_record.not_found');

      await checkIdentifierCollision({ primaryPhone: phone }, userId);

      const updatedUser = await updateUserById(userId, { primaryPhone: phone });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/profile/identities',
    koaGuard({
      body: z.object({
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { newIdentifierVerificationRecordId } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.social === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );

      assertThat(scopes.has(UserScope.Identities), 'auth.unauthorized');

      // Check new identifier
      const newVerificationRecord = await buildVerificationRecordByIdAndType({
        type: VerificationType.Social,
        id: newIdentifierVerificationRecordId,
        queries,
        libraries,
      });
      assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');

      const {
        socialIdentity: { target, userInfo },
      } = await newVerificationRecord.toUserProfile();

      await checkIdentifierCollision({ identity: { target, id: userInfo.id } }, userId);

      const user = await findUserById(userId);

      assertThat(!user.identities[target], 'user.identity_already_in_use');

      const updatedUser = await updateUserById(userId, {
        identities: {
          ...user.identities,
          [target]: {
            userId: userInfo.id,
            details: userInfo,
          },
        },
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  router.delete(
    '/profile/identities/:target',
    koaGuard({
      params: z.object({ target: z.string() }),
      status: [204, 400, 401, 404],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { target } = ctx.guard.params;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.social === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );

      assertThat(scopes.has(UserScope.Identities), 'auth.unauthorized');

      const user = await findUserById(userId);

      assertThat(
        user.identities[target],
        new RequestError({
          code: 'user.identity_not_exist',
          status: 404,
        })
      );

      const updatedUser = await deleteUserIdentity(userId, target);

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
/* eslint-enable max-lines */
