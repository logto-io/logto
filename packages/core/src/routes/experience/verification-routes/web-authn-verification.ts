/* eslint-disable max-lines */
import {
  AdditionalIdentifier,
  SentinelActivityAction,
  SignInIdentifier,
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
import { generateWebAuthnAuthenticationOptions } from '#src/routes/interaction/utils/webauthn.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { withSentinel } from '../classes/libraries/sentinel-guard.js';
import { findUserByIdentifier } from '../classes/utils.js';
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
     * Generate WebAuthn authentication options for identifier-based passkey sign-in.
     * Unlike discoverable passkey sign-in, this route takes an identifier to look up
     * the user's WebAuthn credentials and generates non-discoverable authentication options.
     */
    router.post(
      `${experienceRoutes.verification}/sign-in-web-authn/authentication`,
      koaGuard({
        body: z.object({
          identifier: z.object({
            type: z.nativeEnum(SignInIdentifier),
            value: z.string(),
          }),
        }),
        response: z.object({
          verificationId: z.string(),
          authenticationOptions: webAuthnAuthenticationOptionsGuard,
        }),
        status: [200, 400, 404],
      }),
      koaExperienceVerificationsAuditLog({
        type: VerificationType.SignInWebAuthn,
        action: Action.Create,
      }),
      async (ctx, next) => {
        const { experienceInteraction, verificationAuditLog } = ctx;
        const { identifier } = ctx.guard.body;

        // Look up user by identifier to get their WebAuthn credentials
        const user = await findUserByIdentifier(queries.users, identifier);

        const { mfaVerifications = [] } = user ?? {};
        const { hostname } = ctx.URL;

        const authenticationOptions = await generateWebAuthnAuthenticationOptions({
          mfaVerifications,
          rpId: hostname,
          allowDiscoverable: false,
        });

        const webAuthnVerification = new SignInWebAuthnVerification(libraries, queries, {
          id: generateStandardId(),
          type: VerificationType.SignInWebAuthn,
          userId: user?.id,
          verified: false,
          authenticationChallenge: authenticationOptions.challenge,
          authenticationRpId: authenticationOptions.rpId ?? hostname,
        });

        verificationAuditLog.append({
          payload: {
            verificationId: webAuthnVerification.id,
            identifier,
          },
        });

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

    /**
     * Verify passkey authentication for sign-in flow. This route is used for both with and without identifier flows.
     *
     * Case I: With identifier (non-discoverable passkey)
     * When the verification ID is provided, this route is used after the client has completed the WebAuthn ceremony
     * initiated by the identifier-passkey authentication options endpoint above. A verification record is created
     * in previous step to store the challenge and rpId.
     *
     * Flow:
     * 1. Client calls `/api/experience/verification/sign-in-web-authn/authentication` with identifier to get authentication options
     * 2. User completes WebAuthn authentication with the browser
     * 3. Client submits verification with this endpoint to complete sign-in
     *
     * @see POST /api/experience/verification/sign-in-web-authn/authentication
     *
     * Case II: Without identifier (discoverable passkey)
     * When the verification ID is not provided, this route must be used in conjunction with the authentication
     * options generation endpoint in `./anonymous-routes/index.ts` which generates the initial challenge.
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
          verificationId: z.string().optional(),
          payload: webAuthnVerificationPayloadGuard,
        }),
        response: z.object({
          verificationId: z.string(),
        }),
        status: [200, 400, 404, 409],
      }),
      koaExperienceVerificationsAuditLog({
        type: VerificationType.SignInWebAuthn,
        action: Action.Submit,
      }),
      async (ctx, next) => {
        const { experienceInteraction, verificationAuditLog } = ctx;
        const { verificationId, payload } = ctx.guard.body;

        const webAuthnVerification: SignInWebAuthnVerification = verificationId
          ? // Case I: With identifier (non-discoverable passkey).
            // Verification record created in previous step.
            experienceInteraction.getVerificationRecordByTypeAndId(
              VerificationType.SignInWebAuthn,
              verificationId
            )
          : await (async () => {
              // Case II: Without identifier (discoverable passkey).
              // Retrieve challenge from interaction details, and create verification record.
              const details = await provider.interactionDetails(ctx.req, ctx.res);
              const authenticationOptionsParseResult =
                webAuthnAuthenticationOptionsInteractionStorageGuard.safeParse(details.result);

              assertThat(
                authenticationOptionsParseResult.success,
                new RequestError({ code: 'session.verification_session_not_found', status: 404 })
              );

              const { authenticationOptions } =
                authenticationOptionsParseResult.data.signInWebAuthn;

              return new SignInWebAuthnVerification(libraries, queries, {
                id: generateStandardId(),
                type: VerificationType.SignInWebAuthn,
                verified: false,
                authenticationChallenge: authenticationOptions.challenge,
                authenticationRpId: authenticationOptions.rpId,
              });
            })();

        verificationAuditLog.append({
          payload: {
            verificationId: webAuthnVerification.id,
            payload,
          },
        });

        await webAuthnVerification.verifyWebAuthnAuthentication(ctx, payload);

        experienceInteraction.setVerificationRecord(webAuthnVerification);

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
/* eslint-enable max-lines */
