import { emailRegEx, phoneRegEx, UserScope } from '@logto/core-kit';
import { VerificationType, AccountCenterControlValue } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import { assertUserHasRemainingIdentifier } from '#src/utils/user.js';

import RequestError from '../../errors/RequestError/index.js';
import { validateEmailAgainstBlocklistPolicy } from '../../libraries/sign-in-experience/email-blocklist-policy.js';
import { buildVerificationRecordByIdAndType } from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function emailAndPhoneRoutes<T extends UserRouter>(...args: RouterInitArgs<T>) {
  const [router, { queries, libraries }] = args;
  const {
    users: { updateUserById, findUserById },
    signInExperiences: { findDefaultSignInExperience },
    userSsoIdentities,
  } = queries;

  const {
    users: { checkIdentifierCollision },
  } = libraries;

  router.post(
    `${accountApiPrefix}/primary-email`,
    koaGuard({
      body: z.object({
        email: z.string().regex(emailRegEx),
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401, 422],
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
        'account_center.field_not_editable'
      );

      assertThat(scopes.has(UserScope.Email), 'auth.unauthorized');

      // Validate email blocklist policy
      const { emailBlocklistPolicy } = await findDefaultSignInExperience();
      await validateEmailAgainstBlocklistPolicy(emailBlocklistPolicy, email);

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

  router.delete(
    `${accountApiPrefix}/primary-email`,
    koaGuard({
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.email === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      assertThat(scopes.has(UserScope.Email), 'auth.unauthorized');

      const [user, ssoIdentities] = await Promise.all([
        findUserById(userId),
        userSsoIdentities.findUserSsoIdentitiesByUserId(userId),
      ]);
      assertUserHasRemainingIdentifier(user, { primaryEmail: null }, ssoIdentities.length);

      const updatedUser = await updateUserById(userId, { primaryEmail: null });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${accountApiPrefix}/primary-phone`,
    koaGuard({
      body: z.object({
        phone: z.string().regex(phoneRegEx),
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401, 422],
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
        'account_center.field_not_editable'
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

  router.delete(
    `${accountApiPrefix}/primary-phone`,
    koaGuard({
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.phone === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      assertThat(scopes.has(UserScope.Phone), 'auth.unauthorized');

      const [user, ssoIdentities] = await Promise.all([
        findUserById(userId),
        userSsoIdentities.findUserSsoIdentitiesByUserId(userId),
      ]);
      assertUserHasRemainingIdentifier(user, { primaryPhone: null }, ssoIdentities.length);

      const updatedUser = await updateUserById(userId, { primaryPhone: null });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
