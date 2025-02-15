import { emailRegEx, phoneRegEx, UserScope } from '@logto/core-kit';
import { VerificationType, AccountCenterControlValue, SignInIdentifier } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import { buildVerificationRecordByIdAndType } from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function emailAndPhoneRoutes<T extends UserRouter>(...args: RouterInitArgs<T>) {
  const [router, { queries, libraries }] = args;
  const {
    users: { updateUserById, findUserById },
    signInExperiences: { findDefaultSignInExperience },
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
        'account_center.filed_not_editable'
      );

      assertThat(scopes.has(UserScope.Email), 'auth.unauthorized');

      const { signUp } = await findDefaultSignInExperience();

      if (signUp.identifiers.includes(SignInIdentifier.Email)) {
        // If email is the only sign-up identifier, we need to keep the email
        assertThat(signUp.identifiers.includes(SignInIdentifier.Phone), 'user.email_required');
        // If phone is also a sign-up identifier, check if phone is set
        const user = await findUserById(userId);
        assertThat(user.primaryPhone, 'user.email_or_phone_required');
      }

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
        'account_center.filed_not_editable'
      );

      assertThat(scopes.has(UserScope.Phone), 'auth.unauthorized');

      const { signUp } = await findDefaultSignInExperience();

      if (signUp.identifiers.includes(SignInIdentifier.Phone)) {
        // If phone is the only sign-up identifier, we need to keep the phone
        assertThat(signUp.identifiers.includes(SignInIdentifier.Email), 'user.phone_required');
        // If email is also a sign-up identifier, check if email is set
        const user = await findUserById(userId);
        assertThat(user.primaryEmail, 'user.email_or_phone_required');
      }

      const updatedUser = await updateUserById(userId, { primaryPhone: null });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
