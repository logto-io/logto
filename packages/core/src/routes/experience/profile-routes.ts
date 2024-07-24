import {
  InteractionEvent,
  MfaFactor,
  SignInIdentifier,
  updateProfileApiPayloadGuard,
} from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { identifierCodeVerificationTypeMap } from './classes/verifications/code-verification.js';
import { experienceRoutes } from './const.js';
import { type WithExperienceInteractionContext } from './middleware/koa-experience-interaction.js';

export default function interactionProfileRoutes<T extends WithLogContext>(
  router: Router<unknown, WithExperienceInteractionContext<T>>,
  tenant: TenantContext
) {
  router.post(
    `${experienceRoutes.profile}`,
    koaGuard({
      body: updateProfileApiPayloadGuard,
      status: [204, 400, 403, 404, 422],
    }),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;

      // Guard current interaction event is not ForgotPassword
      assertThat(
        experienceInteraction.interactionEvent !== InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.not_supported_for_forgot_password',
          statue: 400,
        })
      );

      // Guard MFA verification status
      await experienceInteraction.guardMfaVerificationStatus();

      const profilePayload = guard.body;

      switch (profilePayload.type) {
        case SignInIdentifier.Email:
        case SignInIdentifier.Phone: {
          const verificationType = identifierCodeVerificationTypeMap[profilePayload.type];
          await experienceInteraction.profile.setProfileByVerificationRecord(
            verificationType,
            profilePayload.verificationId
          );
          break;
        }
        case SignInIdentifier.Username: {
          await experienceInteraction.profile.setProfileWithValidation({
            username: profilePayload.value,
          });
          break;
        }
        case 'password': {
          await experienceInteraction.profile.setPasswordDigestWithValidation(profilePayload.value);
        }
      }

      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  router.put(
    `${experienceRoutes.profile}/password`,
    koaGuard({
      body: z.object({
        password: z.string(),
      }),
      status: [204, 400, 404, 422],
    }),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;
      const { password } = guard.body;

      assertThat(
        experienceInteraction.interactionEvent === InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.invalid_interaction_type',
          status: 400,
        })
      );

      // Guard interaction is identified
      assertThat(
        experienceInteraction.identifiedUserId,
        new RequestError({
          code: 'session.identifier_not_found',
          status: 404,
        })
      );

      await experienceInteraction.profile.setPasswordDigestWithValidation(password, true);
      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.mfa}/mfa-skipped`,
    koaGuard({ status: [204, 400, 403, 404, 422] }),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;

      // Guard current interaction event is not ForgotPassword
      assertThat(
        experienceInteraction.interactionEvent !== InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.not_supported_for_forgot_password',
          statue: 400,
        })
      );

      // Guard current interaction event is identified and MFA verified
      await experienceInteraction.guardMfaVerificationStatus();

      await experienceInteraction.mfa.skip();
      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.mfa}`,
    koaGuard({
      body: z.object({
        type: z.literal(MfaFactor.TOTP).or(z.literal(MfaFactor.WebAuthn)),
        verificationId: z.string(),
      }),
      status: [204, 400, 403, 404, 422],
    }),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;
      const { type, verificationId } = guard.body;

      // Guard current interaction event is not ForgotPassword
      assertThat(
        experienceInteraction.interactionEvent !== InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.not_supported_for_forgot_password',
          statue: 400,
        })
      );

      // Guard current interaction event is identified and MFA verified
      await experienceInteraction.guardMfaVerificationStatus();

      switch (type) {
        case MfaFactor.TOTP: {
          await experienceInteraction.mfa.addTotpByVerificationId(verificationId);
          break;
        }
        case MfaFactor.WebAuthn: {
          await experienceInteraction.mfa.addWebAuthnByVerificationId(verificationId);
          break;
        }
      }

      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.mfa}/backup-codes/generate`,
    koaGuard({
      status: [200, 400, 403, 404, 422],
      response: z.object({
        codes: z.array(z.string()),
      }),
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      // Guard current interaction event is not ForgotPassword
      assertThat(
        experienceInteraction.interactionEvent !== InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.not_supported_for_forgot_password',
          statue: 400,
        })
      );

      // Guard current interaction event is identified and MFA verified
      await experienceInteraction.guardMfaVerificationStatus();

      const backupCodes = await experienceInteraction.mfa.generateBackupCodes();

      await experienceInteraction.save();

      ctx.body = { codes: backupCodes };

      return next();
    }
  );

  router.post(
    `${experienceRoutes.mfa}/backup-codes`,
    koaGuard({
      body: z.object({
        codes: z.array(z.string()),
      }),
      status: [200, 400, 403, 404, 422],
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;
      const { codes } = ctx.guard.body;

      // Guard current interaction event is not ForgotPassword
      assertThat(
        experienceInteraction.interactionEvent !== InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.not_supported_for_forgot_password',
          statue: 400,
        })
      );

      // Guard current interaction event is identified and MFA verified
      await experienceInteraction.guardMfaVerificationStatus();

      await experienceInteraction.mfa.addBackupCodes(codes);
      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );
}
