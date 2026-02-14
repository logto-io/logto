import {
  type BindWebAuthnPayload,
  InteractionEvent,
  MfaFactor,
  type SignInIdentifier,
  type WebAuthnAuthenticationOptions,
  type WebAuthnVerificationPayload,
} from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';
import { identifyAndSubmitInteraction, initInteraction, submitInteraction } from './interaction';
import { bindMfa } from './mfa';

export { createWebAuthnRegistration as createSignInWebAuthnRegistrationOptions } from './mfa';

export const bindSignInWebAuthn = async (payload: BindWebAuthnPayload, verificationId: string) =>
  bindMfa(MfaFactor.WebAuthn, verificationId, payload);

export const createSignInWebAuthnAuthenticationOptions = async () =>
  api.post(`${experienceApiRoutes.prefix}/preflight/sign-in-web-authn/authentication`).json<{
    authenticationOptions: WebAuthnAuthenticationOptions;
  }>();

export const verifySignInWebAuthn = async (payload: WebAuthnVerificationPayload) => {
  const { verificationId } = await api
    .post(`${experienceApiRoutes.verification}/sign-in-web-authn/authentication/verify`, {
      json: { payload },
    })
    .json<{ verificationId: string }>();

  return identifyAndSubmitInteraction({ verificationId });
};

/**
 * Skip binding passkey for the current user.
 *
 * Note: When calling this API on sign-up, the skip is temporary for the current interaction.
 * On sign-in, the skip flag will be persisted to user config.
 */
export const skipPasskeyBinding = async () => {
  await api.post(`${experienceApiRoutes.profile}/mfa/passkey-skipped`);
  return submitInteraction();
};

/**
 * Create WebAuthn authentication options for identifier-based passkey sign-in.
 * The user has already provided an identifier (email/phone/username) and we
 * generate non-discoverable authentication options for their passkey credentials.
 */
export const createIdentifierPasskeyAuthentication = async (identifier: {
  type: SignInIdentifier;
  value: string;
}) => {
  await initInteraction(InteractionEvent.SignIn);

  const { verificationId, authenticationOptions } = await api
    .post(`${experienceApiRoutes.verification}/sign-in-web-authn/authentication`, {
      json: { identifier },
    })
    .json<{
      verificationId: string;
      authenticationOptions: WebAuthnAuthenticationOptions;
    }>();

  return { verificationId, options: authenticationOptions };
};

/**
 * Verify the identifier-based passkey authentication response
 * and identify + submit the interaction.
 */
export const verifyIdentifierPasskey = async (
  verificationId: string,
  payload: WebAuthnVerificationPayload
) => {
  const result = await api
    .post(`${experienceApiRoutes.verification}/sign-in-web-authn/authentication/verify`, {
      json: { verificationId, payload },
    })
    .json<{ verificationId: string }>();

  return identifyAndSubmitInteraction({ verificationId: result.verificationId });
};
