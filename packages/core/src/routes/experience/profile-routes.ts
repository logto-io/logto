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
        type: z.nativeEnum(MfaFactor),
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
        case MfaFactor.BackupCode: {
          await experienceInteraction.mfa.addBackupCodeByVerificationId(verificationId);
          break;
        }
      }

      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );
}
