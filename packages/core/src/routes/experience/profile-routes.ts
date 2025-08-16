import {
  InteractionEvent,
  MfaFactor,
  SignInIdentifier,
  updateProfileApiPayloadGuard,
} from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { EnvSet } from '../../env-set/index.js';

import { createNewMfaCodeVerificationRecord } from './classes/verifications/code-verification.js';
import { experienceRoutes } from './const.js';
import { type ExperienceInteractionRouterContext } from './types.js';

/**
 * This middleware is guards the current interaction status is MFA verified (if MFA is enabled)
 *
 * @throws {RequestError} with status 400 if current interaction is ForgotPassword
 * @throws {RequestError} with status 404 if current interaction is not identified
 * @throws {RequestError} with status 403 if MFA verification status is not verified
 */
function verifiedInteractionGuard<
  StateT,
  ContextT extends WithLogContext,
  ResponseT,
>(): MiddlewareType<StateT, ExperienceInteractionRouterContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const { experienceInteraction } = ctx;

    // Guard current interaction event is not ForgotPassword
    assertThat(
      experienceInteraction.interactionEvent !== InteractionEvent.ForgotPassword,
      new RequestError({
        code: 'session.not_supported_for_forgot_password',
        statue: 400,
      })
    );

    await experienceInteraction.guardMfaVerificationStatus();

    return next();
  };
}

export default function interactionProfileRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  { libraries, queries }: TenantContext
) {
  router.post(
    `${experienceRoutes.profile}`,
    koaGuard({
      body: updateProfileApiPayloadGuard,
      status: [204, 400, 403, 404, 422],
    }),
    async (ctx, next) => {
      const { experienceInteraction, guard, createLog } = ctx;
      const profilePayload = guard.body;
      const { interactionEvent } = experienceInteraction;

      const log = createLog(`Interaction.${interactionEvent}.Profile.Update`);

      // Guard current interaction event is not ForgotPassword
      assertThat(
        interactionEvent !== InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.not_supported_for_forgot_password',
          statue: 400,
        })
      );

      //  User profile updates require MFA verification (if MFA is enabled) during the sign-in event.
      if (interactionEvent === InteractionEvent.SignIn) {
        await experienceInteraction.guardMfaVerificationStatus();
      }

      log.append({
        payload: profilePayload,
      });

      switch (profilePayload.type) {
        case SignInIdentifier.Email:
        case SignInIdentifier.Phone:
        case 'social': {
          await experienceInteraction.profile.setProfileByVerificationId(
            profilePayload.type,
            profilePayload.verificationId,
            log
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
          break;
        }
        /**
         * Handle non-identifier user profile attributes. The submitted data will be validated and split into
         * standard user profile attributes and custom user profile attributes. The standard user profile attributes
         * will be set to the user profile, and the custom user profile attributes will be set to the user custom data.
         */
        case 'extraProfile': {
          const { validateAndParseCustomProfile } = experienceInteraction.profile.profileValidator;
          await experienceInteraction.profile.setProfileWithValidation(
            validateAndParseCustomProfile(profilePayload.values)
          );
          break;
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
      const { experienceInteraction, guard, createLog } = ctx;
      const { password } = guard.body;

      assertThat(
        experienceInteraction.interactionEvent === InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.invalid_interaction_type',
          status: 400,
        })
      );

      createLog(`Interaction.ForgotPassword.Profile.Update`);

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
    verifiedInteractionGuard(),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

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
    verifiedInteractionGuard(),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;
      const { type, verificationId } = guard.body;

      const log = ctx.createLog(
        `Interaction.${experienceInteraction.interactionEvent}.BindMfa.${type}.Submit`
      );

      log.append({
        verificationId,
      });

      switch (type) {
        case MfaFactor.TOTP: {
          await experienceInteraction.mfa.addTotpByVerificationId(verificationId, log);
          break;
        }
        case MfaFactor.WebAuthn: {
          await experienceInteraction.mfa.addWebAuthnByVerificationId(verificationId, log);
          break;
        }
        case MfaFactor.BackupCode: {
          await experienceInteraction.mfa.addBackupCodeByVerificationId(verificationId, log);
          break;
        }
        case MfaFactor.EmailVerificationCode: {
          if (!EnvSet.values.isDevFeaturesEnabled) {
            throw new Error('Not implemented yet');
          }

          await experienceInteraction.profile.setProfileByVerificationId(
            SignInIdentifier.Email,
            verificationId,
            log
          );
          const { primaryEmail } = experienceInteraction.profile.data;
          // If the primary email is set, create a new MFA code verification record
          // to bypass the MFA verification step.
          if (primaryEmail) {
            const codeVerification = createNewMfaCodeVerificationRecord(
              libraries,
              queries,
              {
                type: SignInIdentifier.Email,
                value: primaryEmail,
              },
              true
            );
            experienceInteraction.setVerificationRecord(codeVerification);
          }
          break;
        }
        case MfaFactor.PhoneVerificationCode: {
          if (!EnvSet.values.isDevFeaturesEnabled) {
            throw new Error('Not implemented yet');
          }

          await experienceInteraction.profile.setProfileByVerificationId(
            SignInIdentifier.Phone,
            verificationId,
            log
          );
          const { primaryPhone } = experienceInteraction.profile.data;
          // If the primary phone is set, create a new MFA code verification record
          // to bypass the MFA verification step.
          if (primaryPhone) {
            const codeVerification = createNewMfaCodeVerificationRecord(
              libraries,
              queries,
              {
                type: SignInIdentifier.Phone,
                value: primaryPhone,
              },
              true
            );
            experienceInteraction.setVerificationRecord(codeVerification);
          }
          break;
        }
      }

      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );
}
