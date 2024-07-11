import { VerificationType, totpVerificationVerifyPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { TotpVerification } from '../classes/verifications/totp-verification.js';
import { experienceRoutes } from '../const.js';
import { type WithExperienceInteractionContext } from '../middleware/koa-experience-interaction.js';

export default function totpVerificationRoutes<T extends WithLogContext>(
  router: Router<unknown, WithExperienceInteractionContext<T>>,
  tenantContext: TenantContext
) {
  const { libraries, queries } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/totp/secret`,
    koaGuard({
      response: z.object({
        verificationId: z.string(),
        secret: z.string(),
        secretQrCode: z.string(),
      }),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      assertThat(experienceInteraction.identifiedUserId, 'session.identifier_not_found');

      // TODO: Check if the MFA is enabled
      // TODO: Check if the interaction is fully verified

      const totpVerification = TotpVerification.create(
        libraries,
        queries,
        experienceInteraction.identifiedUserId
      );

      const { secret, secretQrCode } = await totpVerification.generateNewSecret(ctx);

      ctx.experienceInteraction.setVerificationRecord(totpVerification);

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: totpVerification.id,
        secret,
        secretQrCode,
      };

      return next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/totp/verify`,
    koaGuard({
      body: totpVerificationVerifyPayloadGuard,
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;
      const { verificationId, code } = ctx.guard.body;

      assertThat(experienceInteraction.identifiedUserId, 'session.identifier_not_found');

      // Verify new generated secret
      if (verificationId) {
        const totpVerificationRecord =
          experienceInteraction.getVerificationRecordById(verificationId);

        assertThat(
          totpVerificationRecord &&
            totpVerificationRecord.type === VerificationType.TOTP &&
            totpVerificationRecord.userId === experienceInteraction.identifiedUserId,
          new RequestError({
            code: 'session.verification_session_not_found',
            status: 404,
          })
        );

        totpVerificationRecord.verifyNewTotpSecret(code);

        await ctx.experienceInteraction.save();

        ctx.body = {
          verificationId: totpVerificationRecord.id,
        };

        return next();
      }

      // Verify existing totp record
      const totpVerificationRecord = TotpVerification.create(
        libraries,
        queries,
        experienceInteraction.identifiedUserId
      );

      await totpVerificationRecord.verifyUserExistingTotp(code);

      ctx.experienceInteraction.setVerificationRecord(totpVerificationRecord);

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: totpVerificationRecord.id,
      };

      return next();
    }
  );
}
