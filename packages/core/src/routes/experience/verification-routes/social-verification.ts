import { GoogleConnector } from '@logto/connector-kit';
import {
  VerificationType,
  socialAuthorizationUrlPayloadGuard,
  socialVerificationCallbackPayloadGuard,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { SocialVerification } from '../classes/verifications/social-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function socialVerificationRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
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
    koaExperienceVerificationsAuditLog({
      type: VerificationType.Social,
      action: Action.Create,
    }),
    async (ctx, next) => {
      const { connectorId } = ctx.guard.params;
      const { verificationAuditLog } = ctx;

      verificationAuditLog.append({
        payload: {
          connectorId,
          ...ctx.guard.body,
        },
      });

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
    koaExperienceVerificationsAuditLog({
      type: VerificationType.Social,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { connectorId } = ctx.guard.params;
      const { connectorData, verificationId } = ctx.guard.body;
      const { verificationAuditLog } = ctx;
      const {
        socials: { getConnector },
      } = libraries;

      verificationAuditLog.append({
        payload: {
          connectorId,
          verificationId,
          connectorData,
        },
      });

      const connector = await getConnector(connectorId);

      const socialVerificationRecord = (() => {
        // Check if is Google one tap verification
        if (
          connector.metadata.id === GoogleConnector.factoryId &&
          connectorData[GoogleConnector.oneTapParams.credential]
        ) {
          const socialVerificationRecord = SocialVerification.create(
            libraries,
            queries,
            connectorId
          );
          ctx.experienceInteraction.setVerificationRecord(socialVerificationRecord);
          return socialVerificationRecord;
        }

        if (verificationId) {
          return ctx.experienceInteraction.getVerificationRecordByTypeAndId(
            VerificationType.Social,
            verificationId
          );
        }

        // No verificationId provided and not Google one tap callback
        throw new RequestError({
          code: 'session.verification_session_not_found',
          status: 404,
        });
      })();

      assertThat(
        socialVerificationRecord.connectorId === connectorId,
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );

      await socialVerificationRecord.verify(ctx, tenantContext, connectorData);
      await ctx.experienceInteraction.save();

      // The input verificationId may be undefined if it's a Google one tap callback
      ctx.body = {
        verificationId: socialVerificationRecord.id,
      };

      return next();
    }
  );
}
