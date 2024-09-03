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

import { EnterpriseSsoVerification } from '../classes/verifications/enterprise-sso-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function enterpriseSsoVerificationRoutes<
  T extends ExperienceInteractionRouterContext,
>(router: Router<unknown, T>, tenantContext: TenantContext) {
  const { libraries, queries } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/sso/:connectorId/authorization-uri`,
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
      type: VerificationType.EnterpriseSso,
      action: Action.Create,
    }),
    async (ctx, next) => {
      const { connectorId } = ctx.guard.params;

      ctx.verificationAuditLog.append({
        payload: {
          connectorId,
          ...ctx.guard.body,
        },
      });

      const enterpriseSsoVerification = EnterpriseSsoVerification.create(
        libraries,
        queries,
        connectorId
      );

      const authorizationUri = await enterpriseSsoVerification.createAuthorizationUrl(
        ctx,
        tenantContext,
        ctx.guard.body
      );

      ctx.experienceInteraction.setVerificationRecord(enterpriseSsoVerification);

      await ctx.experienceInteraction.save();

      ctx.body = {
        authorizationUri,
        verificationId: enterpriseSsoVerification.id,
      };

      return next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/sso/:connectorId/verify`,
    koaGuard({
      params: z.object({
        connectorId: z.string(),
      }),
      body: socialVerificationCallbackPayloadGuard.merge(
        z.object({
          verificationId: z.string(),
        })
      ),
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404, 500],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.EnterpriseSso,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { connectorId } = ctx.params;
      const { connectorData, verificationId } = ctx.guard.body;

      ctx.verificationAuditLog.append({
        payload: {
          connectorId,
          verificationId,
          connectorData,
        },
      });

      const enterpriseSsoVerificationRecord =
        ctx.experienceInteraction.getVerificationRecordByTypeAndId(
          VerificationType.EnterpriseSso,
          verificationId
        );

      assertThat(
        enterpriseSsoVerificationRecord.connectorId === connectorId,
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );

      await enterpriseSsoVerificationRecord.verify(ctx, tenantContext, connectorData);

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId,
      };

      return next();
    }
  );

  router.get(
    `${experienceRoutes.verification}/sso/connectors`,
    koaGuard({
      query: z.object({
        email: z.string().email(),
      }),
      status: [200, 400],
      response: z.object({
        connectorIds: z.string().array(),
      }),
    }),
    async (ctx, next) => {
      const { email } = ctx.guard.query;
      const {
        experienceInteraction: { signInExperienceValidator },
      } = ctx;

      assertThat(
        email.split('@')[1],
        new RequestError({ code: 'guard.invalid_input', status: 400, email })
      );

      const connectors = await signInExperienceValidator.getEnabledSsoConnectorsByEmail(email);

      ctx.body = {
        connectorIds: connectors.map(({ id }) => id),
      };

      return next();
    }
  );
}
