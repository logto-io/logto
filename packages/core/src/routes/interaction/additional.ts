import {
  InteractionEvent,
  MfaFactor,
  type RequestVerificationCodePayload,
  requestVerificationCodePayloadGuard,
  webAuthnAuthenticationOptionsGuard,
  webAuthnRegistrationOptionsGuard,
} from '@logto/schemas';
import { getUserDisplayName } from '@logto/shared';
import { type Context } from 'koa';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { z } from 'zod';

import type { WithInteractionDetailsContext } from '#src//middleware/koa-interaction-details.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type PasscodeLibrary } from '#src/libraries/passcode.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { type WithI18nContext } from '#src/middleware/koa-i18next.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getLogtoCookie } from '#src/utils/cookie.js';

import { parseUserProfile } from './actions/helpers.js';
import { interactionPrefix, verificationPath } from './const.js';
import { socialAuthorizationUrlPayloadGuard } from './types/guard.js';
import {
  getInteractionStorage,
  isRegisterInteractionResult,
  isSignInInteractionResult,
  storeInteractionResult,
} from './utils/interaction.js';
import { createSocialAuthorizationUrl } from './utils/social-verification.js';
import { generateTotpSecret } from './utils/totp-validation.js';
import { sendVerificationCodeToIdentifier } from './utils/verification-code-validation.js';
import {
  generateWebAuthnAuthenticationOptions,
  generateWebAuthnRegistrationOptions,
} from './utils/webauthn.js';
import { verifyIdentifier } from './verifications/index.js';
import verifyProfile from './verifications/profile-verification.js';

const buildVerificationCodeTemplateContext = async (
  passcodeLibrary: PasscodeLibrary,
  ctx: Context,
  body: RequestVerificationCodePayload
) => {
  // Build extra context for email verification only
  if (!('email' in body)) {
    return {};
  }

  // Safely get the orgId and appId context from cookie
  const { appId: applicationId, organizationId } = getLogtoCookie(ctx);

  return passcodeLibrary.buildVerificationCodeContext({
    applicationId,
    organizationId,
  });
};

export default function additionalRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<WithI18nContext<WithLogContext<T>>>>,
  tenant: TenantContext
) {
  const {
    provider,
    libraries: {
      users: { generateUserId },
      passcodes,
    },
    queries: {
      users: { findUserById },
    },
  } = tenant;

  // Create social authorization url interaction verification
  router.post(
    `${interactionPrefix}/${verificationPath}/social-authorization-uri`,
    koaGuard({
      body: socialAuthorizationUrlPayloadGuard,
      status: [200, 400, 404],
      response: z.object({
        redirectTo: z.string(),
      }),
    }),
    async (ctx, next) => {
      // Check interaction exists
      const { event } = getInteractionStorage(ctx.interactionDetails.result);

      assertThat(
        event !== InteractionEvent.ForgotPassword,
        'session.not_supported_for_forgot_password'
      );

      const log = ctx.createLog(`Interaction.${event}.Identifier.Social.Create`);

      const { body: payload } = ctx.guard;

      log.append(payload);

      const redirectTo = await createSocialAuthorizationUrl(ctx, tenant, payload);

      ctx.body = { redirectTo };

      return next();
    }
  );

  // Create passwordless interaction verification-code
  router.post(
    `${interactionPrefix}/${verificationPath}/verification-code`,
    koaGuard({
      body: requestVerificationCodePayloadGuard,
      status: [204, 400, 404, 501],
    }),
    async (ctx, next) => {
      const { interactionDetails, guard, createLog } = ctx;
      // Check interaction exists
      const { event } = getInteractionStorage(interactionDetails.result);

      const messageContext = await buildVerificationCodeTemplateContext(passcodes, ctx, guard.body);
      const { uiLocales } = getLogtoCookie(ctx);

      await sendVerificationCodeToIdentifier(
        {
          event,
          ...guard.body,
          locale: ctx.locale,
          ...(uiLocales && { uiLocales }),
          messageContext,
          ip: ctx.request.ip,
        },
        interactionDetails.jti,
        createLog,
        passcodes
      );

      ctx.status = 204;

      return next();
    }
  );

  // Prepare new totp secret
  router.post(
    `${interactionPrefix}/${verificationPath}/totp`,
    koaGuard({
      status: [200],
      response: z.object({
        secret: z.string(),
        secretQrCode: z.string(),
      }),
    }),
    async (ctx, next) => {
      const { interactionDetails, createLog } = ctx;
      // Check interaction exists
      const interaction = getInteractionStorage(interactionDetails.result);
      const { event } = interaction;
      assertThat(
        event !== InteractionEvent.ForgotPassword,
        'session.not_supported_for_forgot_password'
      );
      createLog(`Interaction.${event}.BindMfa.Totp.Create`);

      const service = ctx.URL.hostname;
      const accountVerifiedInteraction = await verifyIdentifier(ctx, tenant, interaction);
      const profileVerifiedInteraction = await verifyProfile(tenant, accountVerifiedInteraction);

      const secret = generateTotpSecret();
      await storeInteractionResult(
        { pendingMfa: { type: MfaFactor.TOTP, secret } },
        ctx,
        provider,
        true
      );

      if (isRegisterInteractionResult(profileVerifiedInteraction)) {
        const {
          username = null,
          primaryEmail = null,
          primaryPhone = null,
          name = null,
        } = await parseUserProfile(tenant, profileVerifiedInteraction);
        const user = getUserDisplayName({ username, primaryEmail, primaryPhone, name });
        const keyUri = authenticator.keyuri(user ?? 'Unnamed User', service, secret);

        ctx.body = {
          secret,
          secretQrCode: await qrcode.toDataURL(keyUri),
        };

        return next();
      }

      if (isSignInInteractionResult(profileVerifiedInteraction)) {
        const { accountId } = profileVerifiedInteraction;
        const { username, primaryEmail, primaryPhone, name } = await findUserById(accountId);
        const user = getUserDisplayName({ username, primaryEmail, primaryPhone, name });
        const keyUri = authenticator.keyuri(user ?? 'Unnamed User', service, secret);

        ctx.body = {
          secret,
          secretQrCode: await qrcode.toDataURL(keyUri),
        };
      }

      return next();
    }
  );

  router.post(
    `${interactionPrefix}/${verificationPath}/webauthn-registration`,
    koaGuard({
      status: [200],
      response: webAuthnRegistrationOptionsGuard,
    }),
    async (ctx, next) => {
      const { interactionDetails, createLog } = ctx;
      // Check interaction exists
      const interaction = getInteractionStorage(interactionDetails.result);
      const { event } = interaction;
      assertThat(
        event !== InteractionEvent.ForgotPassword,
        'session.not_supported_for_forgot_password'
      );
      createLog(`Interaction.${event}.BindMfa.WebAuthn.Create`);

      // WebAuthn requires user id and name, so we need to verify and get profile first
      const accountVerifiedInteraction = await verifyIdentifier(ctx, tenant, interaction);
      const profileVerifiedInteraction = await verifyProfile(tenant, accountVerifiedInteraction);

      if (isRegisterInteractionResult(profileVerifiedInteraction)) {
        const newAccountId = await generateUserId();
        const newUserProfile = await parseUserProfile(tenant, profileVerifiedInteraction);
        const options = await generateWebAuthnRegistrationOptions({
          rpId: ctx.URL.hostname,
          user: {
            id: newAccountId,
            username: newUserProfile.username ?? newAccountId,
            name: newUserProfile.name ?? null,
            primaryEmail: newUserProfile.primaryEmail ?? null,
            primaryPhone: newUserProfile.primaryPhone ?? null,
            mfaVerifications: [],
          },
        });

        await storeInteractionResult(
          {
            pendingMfa: { type: MfaFactor.WebAuthn, challenge: options.challenge },
            pendingAccountId: newAccountId,
          },
          ctx,
          provider,
          true
        );

        ctx.body = options;

        return next();
      }

      if (isSignInInteractionResult(profileVerifiedInteraction)) {
        const { accountId } = profileVerifiedInteraction;
        const { id, name, username, primaryEmail, primaryPhone, mfaVerifications } =
          await findUserById(accountId);
        const options = await generateWebAuthnRegistrationOptions({
          rpId: ctx.URL.hostname,
          user: {
            id,
            name,
            username,
            primaryEmail,
            primaryPhone,
            mfaVerifications,
          },
        });

        await storeInteractionResult(
          {
            pendingMfa: { type: MfaFactor.WebAuthn, challenge: options.challenge },
          },
          ctx,
          provider,
          true
        );

        ctx.body = options;

        return next();
      }
    }
  );

  router.post(
    `${interactionPrefix}/${verificationPath}/webauthn-authentication`,
    koaGuard({
      status: [200, 400],
      response: webAuthnAuthenticationOptionsGuard,
    }),
    async (ctx, next) => {
      const { interactionDetails, createLog } = ctx;
      // Check interaction exists
      const interaction = getInteractionStorage(interactionDetails.result);
      const { event, accountId } = interaction;
      assertThat(
        event === InteractionEvent.SignIn && accountId,
        new RequestError({
          code: 'session.mfa.mfa_sign_in_only',
        })
      );
      createLog(`Interaction.${event}.Mfa.WebAuthn.Create`);

      const { mfaVerifications } = await findUserById(accountId);
      const options = await generateWebAuthnAuthenticationOptions({
        rpId: ctx.URL.hostname,
        mfaVerifications,
      });

      await storeInteractionResult(
        {
          pendingMfa: { type: MfaFactor.WebAuthn, challenge: options.challenge },
        },
        ctx,
        provider,
        true
      );

      ctx.body = options;

      return next();
    }
  );
}
