/* istanbul ignore file */

import {
  InteractionEvent,
  type BindMfaPayload,
  type EmailVerificationCodePayload,
  type PhoneVerificationCodePayload,
  type SignInIdentifier,
  type SocialConnectorPayload,
  type SocialEmailPayload,
  type SocialPhonePayload,
  type VerifyMfaPayload,
  type WebAuthnAuthenticationOptions,
  type WebAuthnRegistrationOptions,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import api from './api';

export const interactionPrefix = '/api/interaction';

const verificationPath = `verification`;

type Response = {
  redirectTo: string;
};

export type PasswordSignInPayload = { [K in SignInIdentifier]?: string } & { password: string };

export const signInWithPasswordIdentifier = async (payload: PasswordSignInPayload) => {
  await api.put(`${interactionPrefix}`, {
    json: {
      event: InteractionEvent.SignIn,
      identifier: payload,
    },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const registerWithUsernamePassword = async (username: string, password?: string) => {
  await api.put(`${interactionPrefix}`, {
    json: {
      event: InteractionEvent.Register,
      profile: {
        username,
        ...conditional(password && { password }),
      },
    },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const setUserPassword = async (password: string) => {
  await api.patch(`${interactionPrefix}/profile`, {
    json: {
      password,
    },
  });

  const result = await api.post(`${interactionPrefix}/submit`).json<Response | undefined>();

  // Reset password does not have any response body
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return result || { success: true };
};

export type SendVerificationCodePayload = {
  email?: string;
  phone?: string;
};

export const putInteraction = async (event: InteractionEvent) =>
  api.put(`${interactionPrefix}`, { json: { event } });

export const sendVerificationCode = async (payload: SendVerificationCodePayload) => {
  await api.post(`${interactionPrefix}/${verificationPath}/verification-code`, { json: payload });

  return { success: true };
};

export const signInWithVerificationCodeIdentifier = async (
  payload: EmailVerificationCodePayload | PhoneVerificationCodePayload
) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: payload,
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const addProfileWithVerificationCodeIdentifier = async (
  payload: EmailVerificationCodePayload | PhoneVerificationCodePayload
) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: payload,
  });

  const { verificationCode, ...identifier } = payload;

  await api.patch(`${interactionPrefix}/profile`, {
    json: identifier,
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const verifyForgotPasswordVerificationCodeIdentifier = async (
  payload: EmailVerificationCodePayload | PhoneVerificationCodePayload
) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: payload,
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const signInWithVerifiedIdentifier = async () => {
  await api.delete(`${interactionPrefix}/profile`);

  await api.put(`${interactionPrefix}/event`, {
    json: {
      event: InteractionEvent.SignIn,
    },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const registerWithVerifiedIdentifier = async (payload: SendVerificationCodePayload) => {
  await api.put(`${interactionPrefix}/event`, {
    json: {
      event: InteractionEvent.Register,
    },
  });

  await api.put(`${interactionPrefix}/profile`, {
    json: payload,
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const addProfile = async (payload: { username: string } | { password: string }) => {
  await api.patch(`${interactionPrefix}/profile`, { json: payload });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const getSocialAuthorizationUrl = async (
  connectorId: string,
  state: string,
  redirectUri: string
) => {
  await api.put(`${interactionPrefix}`, { json: { event: InteractionEvent.SignIn } });

  return api
    .post(`${interactionPrefix}/${verificationPath}/social-authorization-uri`, {
      json: {
        connectorId,
        state,
        redirectUri,
      },
    })
    .json<Response>();
};

export const signInWithSocial = async (payload: SocialConnectorPayload) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: payload,
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const registerWithVerifiedSocial = async (connectorId: string) => {
  await api.put(`${interactionPrefix}/event`, {
    json: {
      event: InteractionEvent.Register,
    },
  });

  await api.patch(`${interactionPrefix}/profile`, {
    json: {
      connectorId,
    },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const bindSocialRelatedUser = async (payload: SocialEmailPayload | SocialPhonePayload) => {
  await api.put(`${interactionPrefix}/event`, {
    json: {
      event: InteractionEvent.SignIn,
    },
  });

  await api.patch(`${interactionPrefix}/identifiers`, {
    json: payload,
  });

  await api.patch(`${interactionPrefix}/profile`, {
    json: {
      connectorId: payload.connectorId,
    },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const linkWithSocial = async (connectorId: string) => {
  // Sign-in with pre-verified email/phone identifier instead and replace the email/phone profile with connectorId.

  await api.put(`${interactionPrefix}/event`, {
    json: {
      event: InteractionEvent.SignIn,
    },
  });

  await api.put(`${interactionPrefix}/profile`, {
    json: {
      connectorId,
    },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const createTotpSecret = async () =>
  api
    .post(`${interactionPrefix}/${verificationPath}/totp`)
    .json<{ secret: string; secretQrCode: string }>();

export const createWebAuthnRegistrationOptions = async () =>
  api
    .post(`${interactionPrefix}/${verificationPath}/webauthn-registration`)
    .json<WebAuthnRegistrationOptions>();

export const generateWebAuthnAuthnOptions = async () =>
  api
    .post(`${interactionPrefix}/${verificationPath}/webauthn-authentication`)
    .json<WebAuthnAuthenticationOptions>();

export const bindMfa = async (payload: BindMfaPayload) => {
  await api.post(`${interactionPrefix}/bind-mfa`, { json: payload });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const verifyMfa = async (payload: VerifyMfaPayload) => {
  await api.put(`${interactionPrefix}/mfa`, { json: payload });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const skipMfa = async () => {
  await api.put(`${interactionPrefix}/mfa-skipped`, { json: { mfaSkipped: true } });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};
