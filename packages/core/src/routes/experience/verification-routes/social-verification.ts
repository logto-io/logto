import {
  VerificationType,
  socialAuthorizationUrlPayloadGuard,
  socialVerificationCallbackPayloadGuard,
} from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { SocialVerification } from '../classes/verifications/social-verification.js';
import { experienceRoutes } from '../const.js';
import { type WithExperienceInteractionContext } from '../middleware/koa-experience-interaction.js';

export default function socialVerificationRoutes<T extends WithLogContext>(
  router: Router<unknown, WithExperienceInteractionContext<T>>,
  tenantContext: TenantContext
) {
  const { libraries, queries } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/social/:connectorId/authorization-uri`,
    koaGuard({
      params: z.object({
        connectorId: z.string(),
      }),
      body: socialAuthorizationUrlPayloadGuard,
      response: z.object({
        authorizationUri: z.string(),
        verificationId: z.string(),
      }),
      status: [200, 400, 404, 500],
    }),
    async (ctx, next) => {
      const { connectorId } = ctx.guard.params;

      const socialVerification = SocialVerification.create(libraries, queries, connectorId);

      const authorizationUri = await socialVerification.createAuthorizationUrl(
        ctx,
        tenantContext,
        ctx.guard.body
      );

      ctx.experienceInteraction.setVerificationRecord(socialVerification);

      await ctx.experienceInteraction.save();

      ctx.body = {
        authorizationUri,
        verificationId: socialVerification.id,
      };

      return next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/social/:connectorId/verify`,
    koaGuard({
      params: z.object({
        connectorId: z.string(),
      }),
      body: socialVerificationCallbackPayloadGuard,
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { connectorId } = ctx.params;
      const { connectorData, verificationId } = ctx.guard.body;

      const socialVerificationRecord =
        ctx.experienceInteraction.getVerificationRecordById(verificationId);

      assertThat(
        socialVerificationRecord &&
          socialVerificationRecord.type === VerificationType.Social &&
          socialVerificationRecord.connectorId === connectorId,
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );

      await socialVerificationRecord.verify(ctx, tenantContext, connectorData);

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId,
      };

      return next();
    }
  );
}
