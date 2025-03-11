import {
  oneTimeTokenVerificationVerifyPayloadGuard,
  SentinelActivityAction,
  VerificationType,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { withSentinel } from '../classes/libraries/sentinel-guard.js';
import { OneTimeTokenVerification } from '../classes/verifications/one-time-token-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function oneTimeTokenVerificationRoutes<
  T extends ExperienceInteractionRouterContext,
>(router: Router<unknown, T>, tenantContext: TenantContext) {
  const { libraries, queries, sentinel } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/one-time-token/verify`,
    koaGuard({
      body: oneTimeTokenVerificationVerifyPayloadGuard,
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.OneTimeToken,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { experienceInteraction, verificationAuditLog } = ctx;
      const { identifier, token } = ctx.guard.body;

      verificationAuditLog.append({ payload: { identifier, token } });

      const oneTimeTokenVerificationRecord = OneTimeTokenVerification.create(
        libraries,
        queries,
        identifier
      );

      ctx.experienceInteraction.setVerificationRecord(oneTimeTokenVerificationRecord);

      await withSentinel(
        {
          sentinel,
          action: SentinelActivityAction.OneTimeToken,
          identifier,
          payload: {
            event: experienceInteraction.interactionEvent,
            verificationId: oneTimeTokenVerificationRecord.id,
          },
        },
        oneTimeTokenVerificationRecord.verify(token)
      );

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: oneTimeTokenVerificationRecord.id,
      };

      return next();
    }
  );
}
