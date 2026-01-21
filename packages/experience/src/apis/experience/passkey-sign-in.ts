import {
  type BindWebAuthnPayload,
  MfaFactor,
  type WebAuthnAuthenticationOptions,
  type WebAuthnVerificationPayload,
} from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';
import { identifyAndSubmitInteraction } from './interaction';
import { bindMfa } from './mfa';

export { createWebAuthnRegistration as createPasskeySignInRegistrationOptions } from './mfa';

export const bindPasskeyForSignIn = async (payload: BindWebAuthnPayload, verificationId: string) =>
  bindMfa(MfaFactor.WebAuthn, verificationId, payload);

export const createPasskeySignInAuthenticationOptions = async () =>
  api.post(`${experienceApiRoutes.prefix}/passkey-sign-in/authentication`).json<{
    options: WebAuthnAuthenticationOptions;
  }>();

export const verifyPasskeyForSignIn = async (payload: WebAuthnVerificationPayload) => {
  const { verificationId } = await api
    .post(`${experienceApiRoutes.verification}/passkey-sign-in/authentication/verify`, {
      json: { payload },
    })
    .json<{ verificationId: string }>();

  return identifyAndSubmitInteraction({ verificationId });
};
