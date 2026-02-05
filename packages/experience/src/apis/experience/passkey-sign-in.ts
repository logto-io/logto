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
 * Skip binding passkey for the current user.
 *
 * Note: When calling this API on sign-up, the skip is temporary for the current interaction.
 * On sign-in, the skip flag will be persisted to user config.
 */
export const skipPasskeyBinding = async () => {
  await api.post(`${experienceApiRoutes.profile}/mfa/passkey-skipped`);
  return submitInteraction();
};
