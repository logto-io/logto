import { MfaFactor, userMfaVerificationResponseGuard } from '@logto/schemas';
import { getUserDisplayName } from '@logto/shared';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { object, string, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { transpileUserMfaVerifications } from '#src/utils/user.js';

import { generateBackupCodes } from '../interaction/utils/backup-code-validation.js';
import { generateTotpSecret } from '../interaction/utils/totp-validation.js';
import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function adminUserMfaVerificationsRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [
    router,
    {
      queries,
      libraries: {
        users: { addUserMfaVerification },
      },
    },
  ] = args;
  const {
    users: { findUserById, updateUserById },
  } = queries;

  router.get(
    '/users/:userId/mfa-verifications',
    koaGuard({
      params: object({ userId: string() }),
      response: userMfaVerificationResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const user = await findUserById(ctx.guard.params.userId);
      ctx.body = transpileUserMfaVerifications(user.mfaVerifications);
      return next();
    }
  );

  router.post(
    '/users/:userId/mfa-verifications',
    koaGuard({
      params: object({ userId: string() }),
      body: z.object({
        type: z.literal(MfaFactor.TOTP).or(z.literal(MfaFactor.BackupCode)),
      }),
      response: z.discriminatedUnion('type', [
        z.object({
          type: z.literal(MfaFactor.TOTP),
          secret: z.string(),
          secretQrCode: z.string(),
        }),
        z.object({
          type: z.literal(MfaFactor.BackupCode),
          codes: z.string().array(),
        }),
      ]),
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const { id, mfaVerifications, username, primaryEmail, primaryPhone, name } =
        await findUserById(ctx.guard.params.userId);

      const { type } = ctx.guard.body;

      if (type === MfaFactor.TOTP) {
        // A user can only bind one TOTP factor
        assertThat(
          mfaVerifications.every(({ type }) => type !== MfaFactor.TOTP),
          new RequestError({
            code: 'user.totp_already_in_use',
            status: 422,
          })
        );

        const secret = generateTotpSecret();
        const service = ctx.URL.hostname;
        const user = getUserDisplayName({ username, primaryEmail, primaryPhone, name });
        const keyUri = authenticator.keyuri(user ?? 'Unnamed User', service, secret);
        await addUserMfaVerification(id, { type: MfaFactor.TOTP, secret });
        ctx.body = {
          type: MfaFactor.TOTP,
          secret,
          secretQrCode: await qrcode.toDataURL(keyUri),
        };
        return next();
      }

      // A user can only bind one available backup code factor
      assertThat(
        mfaVerifications.every(
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
        mfaVerifications.some(({ type }) => type !== MfaFactor.BackupCode),
        new RequestError({
          code: 'session.mfa.backup_code_can_not_be_alone',
          status: 422,
        })
      );
      const codes = generateBackupCodes();
      await addUserMfaVerification(id, { type: MfaFactor.BackupCode, codes });
      ctx.body = { codes, type: MfaFactor.BackupCode };
      return next();
    }
  );

  router.delete(
    '/users/:userId/mfa-verifications/:verificationId',
    koaGuard({
      params: object({ userId: string(), verificationId: string() }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId, verificationId },
      } = ctx.guard;

      const { mfaVerifications } = await findUserById(userId);

      const verification = mfaVerifications.find(({ id }) => id === verificationId);

      if (!verification) {
        throw new RequestError({
          code: 'entity.not_found',
          status: 404,
        });
      }

      await updateUserById(userId, {
        mfaVerifications: mfaVerifications.filter(({ id }) => id !== verification.id),
      });

      ctx.status = 204;

      return next();
    }
  );
}
