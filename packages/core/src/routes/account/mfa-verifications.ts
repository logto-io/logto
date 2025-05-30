import { UserScope } from '@logto/core-kit';
import { VerificationType, MfaFactor, AccountCenterControlValue } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import { buildVerificationRecordByIdAndType } from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function mfaVerificationsRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById, findUserById },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  router.post(
    `${accountApiPrefix}/mfa-verifications`,
    koaGuard({
      body: z.object({
        type: z.literal(MfaFactor.WebAuthn),
        newIdentifierVerificationRecordId: z.string(),
        name: z.string().optional(),
      }),
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { newIdentifierVerificationRecordId, name } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );

      assertThat(scopes.has(UserScope.Identities), 'auth.unauthorized');

      // Check new identifier
      const newVerificationRecord = await buildVerificationRecordByIdAndType({
        type: VerificationType.WebAuthn,
        id: newIdentifierVerificationRecordId,
        queries,
        libraries,
      });
      assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');

      const bindMfa = newVerificationRecord.toBindMfa();

      const user = await findUserById(userId);

      // Check sign in experience, if webauthn is enabled
      const { mfa } = await findDefaultSignInExperience();
      assertThat(
        mfa.factors.includes(MfaFactor.WebAuthn),
        new RequestError({ code: 'session.mfa.mfa_factor_not_enabled', status: 400 })
      );

      const updatedUser = await updateUserById(userId, {
        mfaVerifications: [
          ...user.mfaVerifications,
          {
            ...bindMfa,
            id: generateStandardId(),
            createdAt: new Date().toISOString(),
            name,
          },
        ],
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  // Update mfa verification name, only support webauthn
  router.patch(
    `${accountApiPrefix}/mfa-verifications/:verificationId/name`,
    koaGuard({
      params: z.object({
        verificationId: z.string(),
      }),
      body: z.object({
        name: z.string(),
      }),
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { name } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit,
        'account_center.filed_not_editable'
      );

      assertThat(scopes.has(UserScope.Identities), 'auth.unauthorized');

      const user = await findUserById(userId);
      const mfaVerification = user.mfaVerifications.find(
        (mfaVerification) =>
          mfaVerification.id === ctx.guard.params.verificationId &&
          mfaVerification.type === MfaFactor.WebAuthn
      );
      assertThat(mfaVerification, 'verification_record.not_found');

      const updatedUser = await updateUserById(userId, {
        mfaVerifications: user.mfaVerifications.map((mfaVerification) =>
          mfaVerification.id === ctx.guard.params.verificationId
            ? { ...mfaVerification, name }
            : mfaVerification
        ),
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 200;

      return next();
    }
  );
}
