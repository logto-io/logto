import { googleOneTapVerificationVerifyPayloadGuard, VerificationType } from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { GoogleOneTapVerification } from '../classes/verifications/google-one-tap-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function googleOneTapVerificationRoutes<
  T extends ExperienceInteractionRouterContext,
>(router: Router<unknown, T>, tenantContext: TenantContext) {
  const { libraries, queries } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/google-one-tap/verify`,
    koaGuard({
      body: googleOneTapVerificationVerifyPayloadGuard,
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.GoogleOneTap,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { verificationAuditLog } = ctx;
      const { credential } = ctx.guard.body;

      verificationAuditLog.append({ payload: { credential } });

      const googleOneTapVerificationRecord = GoogleOneTapVerification.create(libraries, queries);

      ctx.experienceInteraction.setVerificationRecord(googleOneTapVerificationRecord);

      await googleOneTapVerificationRecord.verify(credential);

      // Skip CAPTCHA for Google One Tap flow
      ctx.experienceInteraction.skipCaptcha();
      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: googleOneTapVerificationRecord.id,
      };

      return next();
    }
  );
}
