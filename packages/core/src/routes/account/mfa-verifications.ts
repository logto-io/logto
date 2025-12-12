/* eslint-disable max-lines */
import { UserScope } from '@logto/core-kit';
import {
  VerificationType,
  MfaFactor,
  AccountCenterControlValue,
  userMfaVerificationResponseGuard,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import { buildVerificationRecordByIdAndType } from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import { transpileUserMfaVerifications } from '../../utils/user.js';
import {
  generateBackupCodes,
  validateBackupCodes,
} from '../interaction/utils/backup-code-validation.js';
import {
  generateTotpSecret,
  validateTotpSecret,
  validateTotpToken,
} from '../interaction/utils/totp-validation.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function mfaVerificationsRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById, findUserById },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  router.get(
    `${accountApiPrefix}/mfa-verifications`,
    koaGuard({
      response: userMfaVerificationResponseGuard,
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { fields } = ctx.accountCenter;

      assertThat(
        fields.mfa === AccountCenterControlValue.Edit ||
          fields.mfa === AccountCenterControlValue.ReadOnly,
        'account_center.field_not_enabled'
      );

      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      const user = await findUserById(userId);
      ctx.body = transpileUserMfaVerifications(user.mfaVerifications);

      return next();
    }
  );

  router.post(
    `${accountApiPrefix}/mfa-verifications`,
    koaGuard({
      body: z.discriminatedUnion('type', [
        z.object({
          type: z.literal(MfaFactor.WebAuthn),
          newIdentifierVerificationRecordId: z.string(),
          name: z.string().optional(),
        }),
        z.object({
          type: z.literal(MfaFactor.TOTP),
          secret: z.string(),
          code: z.string().optional(),
        }),
        z.object({
          type: z.literal(MfaFactor.BackupCode),
          codes: z.string().array(),
        }),
      ]),
      status: [204, 400, 401, 422],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      const { fields } = ctx.accountCenter;
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      const user = await findUserById(userId);

      // Check sign in experience, if mfa factor is enabled
      const { mfa } = await findDefaultSignInExperience();
      assertThat(mfa.factors.includes(ctx.guard.body.type), 'session.mfa.mfa_factor_not_enabled');

      switch (ctx.guard.body.type) {
        case MfaFactor.TOTP: {
          const { secret, code } = ctx.guard.body;

          // A user can only bind one TOTP factor
          assertThat(
            user.mfaVerifications.every(({ type }) => type !== MfaFactor.TOTP),
            new RequestError({
              code: 'user.totp_already_in_use',
              status: 422,
            })
          );

          // Check secret
          assertThat(validateTotpSecret(secret), 'user.totp_secret_invalid');

          // Verify TOTP code if provided
          if (code) {
            assertThat(
              validateTotpToken(secret, code),
              new RequestError({
                code: 'session.mfa.invalid_totp_code',
                status: 400,
              })
            );
          }

          const updatedUser = await updateUserById(userId, {
            mfaVerifications: [
              ...user.mfaVerifications,
              {
                id: generateStandardId(),
                createdAt: new Date().toISOString(),
                type: MfaFactor.TOTP,
                key: secret,
              },
            ],
          });

          ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

          break;
        }
        case MfaFactor.BackupCode: {
          // A user can only bind one available backup code factor
          assertThat(
            user.mfaVerifications.every(
              (verification) =>
                verification.type !== MfaFactor.BackupCode ||
                verification.codes.every(({ usedAt }) => usedAt)
            ),
            new RequestError({
              code: 'user.backup_code_already_in_use',
              status: 422,
            })
          );
          assertThat(
            user.mfaVerifications.some(({ type }) => type !== MfaFactor.BackupCode),
            new RequestError({
              code: 'session.mfa.backup_code_can_not_be_alone',
              status: 422,
            })
          );
          assertThat(
            validateBackupCodes(ctx.guard.body.codes),
            new RequestError({
              code: 'user.wrong_backup_code_format',
              status: 422,
            })
          );
          const { codes } = ctx.guard.body;
          const updatedUser = await updateUserById(userId, {
            mfaVerifications: [
              ...user.mfaVerifications,
              {
                id: generateStandardId(),
                createdAt: new Date().toISOString(),
                type: MfaFactor.BackupCode,
                codes: codes.map((code) => ({ code })),
              },
            ],
          });

          ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

          break;
        }
        case MfaFactor.WebAuthn: {
          const { newIdentifierVerificationRecordId, name } = ctx.guard.body;
          // Check new identifier
          const newVerificationRecord = await buildVerificationRecordByIdAndType({
            type: VerificationType.WebAuthn,
            id: newIdentifierVerificationRecordId,
            queries,
            libraries,
          });
          assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');

          const bindMfa = newVerificationRecord.toBindMfa();

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

          break;
        }
        // No default
      }

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${accountApiPrefix}/mfa-verifications/totp-secret/generate`,
    koaGuard({
      status: [200],
    }),
    async (ctx, next) => {
      const secret = generateTotpSecret();
      ctx.body = {
        secret,
      };

      return next();
    }
  );

  router.post(
    `${accountApiPrefix}/mfa-verifications/backup-codes/generate`,
    koaGuard({
      status: [200],
    }),
    async (ctx, next) => {
      const codes = generateBackupCodes();
      ctx.body = {
        codes,
      };

      return next();
    }
  );

  router.get(
    `${accountApiPrefix}/mfa-verifications/backup-codes`,
    koaGuard({
      status: [200, 401, 404],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;

      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );

      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      const user = await findUserById(userId);
      const backupCodeVerification = user.mfaVerifications.find(
        (verification) => verification.type === MfaFactor.BackupCode
      );

      assertThat(
        backupCodeVerification,
        new RequestError({ code: 'verification_record.not_found', status: 404 })
      );

      ctx.body = {
        codes: backupCodeVerification.codes.map(({ code, usedAt }) => ({ code, usedAt })),
      };

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
        'account_center.field_not_editable'
      );

      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

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

  router.delete(
    `${accountApiPrefix}/mfa-verifications/:verificationId`,
    koaGuard({
      params: z.object({
        verificationId: z.string(),
      }),
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
        fields.mfa === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      const user = await findUserById(userId);
      const mfaVerification = user.mfaVerifications.find(
        (mfaVerification) => mfaVerification.id === ctx.guard.params.verificationId
      );
      assertThat(mfaVerification, 'verification_record.not_found');

      const updatedUser = await updateUserById(userId, {
        mfaVerifications: user.mfaVerifications.filter(
          (mfaVerification) => mfaVerification.id !== ctx.guard.params.verificationId
        ),
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
/* eslint-enable max-lines */
