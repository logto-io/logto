import {
  AdditionalIdentifier,
  SentinelActivityAction,
  bindWebAuthnPayloadGuard,
  VerificationType,
  webAuthnAuthenticationOptionsGuard,
  webAuthnRegistrationOptionsGuard,
  webAuthnVerificationPayloadGuard,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import { generateStandardId } from '@logto/shared';
import type Router from 'koa-router';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { withSentinel } from '../classes/libraries/sentinel-guard.js';
import {
  SignInWebAuthnVerification,
  WebAuthnVerification,
} from '../classes/verifications/web-authn-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import {
  webAuthnAuthenticationOptionsInteractionStorageGuard,
  type ExperienceInteractionRouterContext,
} from '../types.js';

export default function webAuthnVerificationRoute<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  tenantContext: TenantContext
) {
  const { libraries, queries, sentinel, provider } = tenantContext;

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
        ctx.URL.hostname
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
        experienceInteraction.identifiedUserId === webAuthnVerification.userId,
        new RequestError({
          code: 'session.identity_conflict',
          status: 404,
        })
      );

      await (EnvSet.values.isDevFeaturesEnabled
        ? withSentinel(
            {
              ctx,
              sentinel,
              action: SentinelActivityAction.WebAuthn,
              identifier: {
                type: AdditionalIdentifier.UserId,
                value: experienceInteraction.identifiedUserId,
              },
              payload: {
                verificationId: webAuthnVerification.id,
              },
            },
            webAuthnVerification.verifyWebAuthnAuthentication(ctx, payload)
          )
        : webAuthnVerification.verifyWebAuthnAuthentication(ctx, payload));

      await experienceInteraction.save();

      ctx.body = {
        verificationId: webAuthnVerification.id,
      };

      ctx.status = 200;

      return next();
    }
  );

  if (EnvSet.values.isDevFeaturesEnabled) {
    /**
     * Verify passkey authentication for sign-in flow.
     * This route must be used in conjunction with the authentication options generation endpoint
     * in `./anonymous-routes/index.ts` which generates the initial challenge.
     *
     * Flow:
     * 1. Client calls `/api/experience/preflight/sign-in-web-authn/authentication` to get authentication options
     * 2. User completes WebAuthn authentication with the browser
     * 3. Client submits verification with this endpoint to complete sign-in
     *
     * @see POST /api/experience/preflight/sign-in-web-authn/authentication
     */
    router.post(
      `${experienceRoutes.verification}/sign-in-web-authn/authentication/verify`,
      koaGuard({
        body: z.object({
          payload: webAuthnVerificationPayloadGuard,
        }),
        response: z.object({
          verificationId: z.string(),
        }),
        status: [200, 400, 404],
      }),
      koaExperienceVerificationsAuditLog({
        type: VerificationType.SignInWebAuthn,
        action: Action.Submit,
      }),
      async (ctx, next) => {
        const { experienceInteraction, verificationAuditLog } = ctx;
        const { payload } = ctx.guard.body;

        const details = await provider.interactionDetails(ctx.req, ctx.res);
        const authenticationOptionsParseResult =
          webAuthnAuthenticationOptionsInteractionStorageGuard.safeParse(details.result);

        assertThat(
          authenticationOptionsParseResult.success,
          'session.verification_session_not_found'
        );

        const webAuthnVerification = new SignInWebAuthnVerification(libraries, queries, {
          id: generateStandardId(),
          type: VerificationType.SignInWebAuthn,
          verified: false,
          ...authenticationOptionsParseResult.data,
        });

        verificationAuditLog.append({
          payload: {
            verificationId: webAuthnVerification.id,
            payload,
          },
        });

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
}
