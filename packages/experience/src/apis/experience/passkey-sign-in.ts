import {
  type BindWebAuthnPayload,
  MfaFactor,
  type WebAuthnAuthenticationOptions,
  type WebAuthnVerificationPayload,
} from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';
import { identifyAndSubmitInteraction, submitInteraction } from './interaction';
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
 * Skip binding passkey for the current user, and persist the decision in user config.
 */
export const skipPasskey = async () => {
  await api.post(`${experienceApiRoutes.profile}/mfa/passkey-skipped`);
  return submitInteraction();
};

/**
 * Temporarily skip passkey sign-in suggestion for the current interaction session.
 */
export const skipPasskeySuggestionOnce = async () => {
  await api.post(`${experienceApiRoutes.profile}/mfa/passkey-suggestion-skipped`);
  return submitInteraction();
};
