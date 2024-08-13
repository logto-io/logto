import {
  bindWebAuthnPayloadGuard,
  VerificationType,
  webAuthnAuthenticationOptionsGuard,
  webAuthnRegistrationOptionsGuard,
  webAuthnVerificationPayloadGuard,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { WebAuthnVerification } from '../classes/verifications/web-authn-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function webAuthnVerificationRoute<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  tenantContext: TenantContext
) {
  const { libraries, queries } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/web-authn/registration`,
    koaGuard({
      response: z.object({
        verificationId: z.string(),
        registrationOptions: webAuthnRegistrationOptionsGuard,
      }),
      status: [200, 400, 404],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.WebAuthn,
      action: Action.Create,
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      assertThat(
        experienceInteraction.identifiedUserId,
        new RequestError({
          code: 'session.identifier_not_found',
          status: 404,
        })
      );

      const webAuthnVerification = WebAuthnVerification.create(
        libraries,
        queries,
        experienceInteraction.identifiedUserId
      );

      const registrationOptions = await webAuthnVerification.generateWebAuthnRegistrationOptions(
        ctx
      );

      experienceInteraction.setVerificationRecord(webAuthnVerification);

      await experienceInteraction.save();

      ctx.body = {
        verificationId: webAuthnVerification.id,
        registrationOptions,
      };

      ctx.status = 200;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/web-authn/registration/verify`,
    koaGuard({
      body: z.object({
        verificationId: z.string(),
        payload: bindWebAuthnPayloadGuard,
      }),
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.WebAuthn,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { experienceInteraction, verificationAuditLog } = ctx;
      const { verificationId, payload } = ctx.guard.body;

      verificationAuditLog.append({
        payload: {
          verificationId,
          payload,
        },
      });

      assertThat(
        experienceInteraction.identifiedUserId,
        new RequestError({
          code: 'session.identifier_not_found',
          status: 404,
        })
      );

      const webAuthnVerification = experienceInteraction.getVerificationRecordByTypeAndId(
        VerificationType.WebAuthn,
        verificationId
      );

      assertThat(
        webAuthnVerification.userId === experienceInteraction.identifiedUserId,
        new RequestError({
          code: 'session.verification_session_not_found',
          status: 404,
        })
      );

      await webAuthnVerification.verifyWebAuthnRegistration(ctx, payload);

      await experienceInteraction.save();

      ctx.body = {
        verificationId: webAuthnVerification.id,
      };

      ctx.status = 200;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/web-authn/authentication`,
    koaGuard({
      response: z.object({
        verificationId: z.string(),
        authenticationOptions: webAuthnAuthenticationOptionsGuard,
      }),
      status: [200, 400, 404],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.WebAuthn,
      action: Action.Create,
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      assertThat(
        experienceInteraction.identifiedUserId,
        new RequestError({
          code: 'session.identifier_not_found',
          status: 404,
        })
      );

      const webAuthnVerification = WebAuthnVerification.create(
        libraries,
        queries,
        experienceInteraction.identifiedUserId
      );

      const authenticationOptions =
        await webAuthnVerification.generateWebAuthnAuthenticationOptions(ctx);

      experienceInteraction.setVerificationRecord(webAuthnVerification);

      await experienceInteraction.save();

      ctx.body = {
        verificationId: webAuthnVerification.id,
        authenticationOptions,
      };

      ctx.status = 200;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/web-authn/authentication/verify`,
    koaGuard({
      body: z.object({
        verificationId: z.string(),
        payload: webAuthnVerificationPayloadGuard,
      }),
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.WebAuthn,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { experienceInteraction, verificationAuditLog } = ctx;
      const { verificationId, payload } = ctx.guard.body;

      verificationAuditLog.append({
        payload: {
          verificationId,
          payload,
        },
      });

      assertThat(
        experienceInteraction.identifiedUserId,
        new RequestError({
          code: 'session.identifier_not_found',
          status: 404,
        })
      );

      const webAuthnVerification = experienceInteraction.getVerificationRecordByTypeAndId(
        VerificationType.WebAuthn,
        verificationId
      );

      assertThat(
        webAuthnVerification.userId === experienceInteraction.identifiedUserId,
        new RequestError({
          code: 'session.verification_session_not_found',
          status: 404,
        })
      );

      await webAuthnVerification.verifyWebAuthnAuthentication(ctx, payload);

      await experienceInteraction.save();

      ctx.body = {
        verificationId: webAuthnVerification.id,
      };

      ctx.status = 200;

      return next();
    }
  );
}
