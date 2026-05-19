/* eslint-disable max-lines */
import {
  InteractionEvent,
  MfaFactor,
  SignInIdentifier,
  updateProfileApiPayloadGuard,
  uploadFileGuard,
  userAssetsGuard,
} from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import type Router from 'koa-router';
import { object, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { getTenantId } from '#src/utils/tenant.js';

import { uploadAvatar } from '../avatar-upload.js';

import { createNewMfaCodeVerificationRecord } from './classes/verifications/code-verification.js';
import { experienceRoutes } from './const.js';
import { type ExperienceInteractionRouterContext } from './types.js';

const avatarUploadRateLimitMaxAttempts = 10;
const avatarUploadRateLimitWindow = 10 * 60 * 1000;

const avatarUploadRateLimitRecords = new Map<string, { count: number; resetAt: number }>();

const buildAvatarUploadRateLimitKey = (jti: string, ip: string) => `${jti}:${ip}`;

const clearExpiredAvatarUploadRateLimitRecords = (now: number) => {
  for (const [key, { resetAt }] of avatarUploadRateLimitRecords.entries()) {
    if (resetAt <= now) {
      avatarUploadRateLimitRecords.delete(key);
    }
  }
};

const assertAvatarUploadRateLimit = (jti: string, ip: string, languages: readonly string[]) => {
  const now = Date.now();
  clearExpiredAvatarUploadRateLimitRecords(now);

  const key = buildAvatarUploadRateLimitKey(jti, ip);
  const record = avatarUploadRateLimitRecords.get(key);

  if (!record) {
    avatarUploadRateLimitRecords.set(key, {
      count: 1,
      resetAt: now + avatarUploadRateLimitWindow,
    });
    return;
  }

  if (record.count >= avatarUploadRateLimitMaxAttempts) {
    const rtf = new Intl.RelativeTimeFormat([...languages]);
    throw new RequestError({
      code: 'session.verification_blocked_too_many_attempts',
      relativeTime: rtf.format(Math.ceil((record.resetAt - now) / 1000 / 60), 'minute'),
      status: 429,
    });
  }

  avatarUploadRateLimitRecords.set(key, {
    ...record,
    count: record.count + 1,
  });
};

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

    if (experienceInteraction.interactionEvent === InteractionEvent.SignIn) {
      await experienceInteraction.guardMfaVerificationStatus();
    }

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

      if (interactionEvent === InteractionEvent.SignIn) {
        // Note:
        // We intentionally allow social profile staging before MFA verification.
        // This endpoint only writes to the interaction session, while `submit()` is the
        // DB commit boundary and still enforces MFA for sign-in flows.
        //
        // On social linking flows, to simplify the front-end implementation, we allow social profile staging before MFA verification,
        // and the final submission with `submit()` will enforce MFA verification.
        // Identified user guard is still applied.
        await (profilePayload.type === 'social'
          ? experienceInteraction.guardIdentifiedUser()
          : experienceInteraction.guardMfaVerificationStatus());
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
          experienceInteraction.profile.markProfileSubmitted();
          break;
        }
      }

      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  // TODO: Remove this dev feature gate when avatar upload is ready for production.
  if (EnvSet.values.isDevFeaturesEnabled) {
    router.post(
      `${experienceRoutes.prefix}/user-assets/avatar`,
      koaGuard({
        files: object({
          file: uploadFileGuard.array().min(1),
        }),
        response: userAssetsGuard,
        status: [200, 400, 403, 404, 500],
      }),
      async (ctx, next) => {
        const { experienceInteraction } = ctx;
        const { interactionEvent } = experienceInteraction;

        assertThat(
          interactionEvent !== InteractionEvent.ForgotPassword,
          new RequestError({ code: 'session.not_supported_for_forgot_password', status: 400 })
        );
        assertThat(
          interactionEvent === InteractionEvent.Register,
          new RequestError({ code: 'session.invalid_interaction_type', status: 400 })
        );

        assertAvatarUploadRateLimit(ctx.interactionDetails.jti, ctx.ip, ctx.i18n.languages);

        const [tenantId] = await getTenantId(ctx.URL);
        assertThat(tenantId, 'guard.can_not_get_tenant_id');

        const { storageProviderConfig } = SystemContext.shared;
        assertThat(storageProviderConfig, 'storage.not_configured');

        const objectKeyPrefix = experienceInteraction.identifiedUserId
          ? `${tenantId}/${experienceInteraction.identifiedUserId}`
          : `${tenantId}/_pending/avatar/${ctx.interactionDetails.jti}`;

        ctx.body = await uploadAvatar({
          file: ctx.guard.files.file[0],
          storageProviderConfig,
          objectKeyPrefix,
          logError: (error) => {
            getConsoleLogFromContext(ctx).error(error);
          },
        });

        return next();
      }
    );
  }

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
    `${experienceRoutes.mfa}/mfa-enabled`,
    koaGuard({ status: [204, 400, 403, 404] }),
    verifiedInteractionGuard(),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      experienceInteraction.mfa.markMfaEnabled();
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

  // Mark optional additional MFA binding suggestion as skipped.
  router.post(
    `${experienceRoutes.mfa}/mfa-suggestion-skipped`,
    koaGuard({ status: [204, 400, 404] }),
    verifiedInteractionGuard(),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      experienceInteraction.mfa.skipAdditionalBindingSuggestion();
      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.mfa}/passkey-skipped`,
    koaGuard({ status: [204, 400, 404] }),
    verifiedInteractionGuard(),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      experienceInteraction.mfa.skipPasskey();
      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.mfa}/passkey`,
    koaGuard({
      body: z.object({
        verificationId: z.string(),
      }),
      status: [204, 400, 404],
    }),
    verifiedInteractionGuard(),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;
      const { verificationId } = guard.body;

      const log = ctx.createLog(
        `Interaction.${experienceInteraction.interactionEvent}.SignInPasskey.Submit`
      );

      log.append({
        verificationId,
      });

      await experienceInteraction.mfa.addWebAuthnByVerificationId(verificationId, log);

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

      experienceInteraction.mfa.markMfaEnabled();

      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );
}
/* eslint-enable max-lines */
