/* istanbul ignore file */

import { InteractionEvent } from '@logto/schemas';
import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  PhonePasswordPayload,
  EmailVerificationCodePayload,
  PhoneVerificationCodePayload,
  SocialConnectorPayload,
  SocialIdentityPayload,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import api from './api';

const interactionPrefix = '/api/interaction';
const verificationPath = `verification`;

type Response = {
  redirectTo: string;
};

export type PasswordSignInPayload =
  | UsernamePasswordPayload
  | EmailPasswordPayload
  | PhonePasswordPayload;

export const signInWithPasswordIdentifier = async (
  payload: PasswordSignInPayload,
  socialToBind?: string
) => {
  if (socialToBind) {
    await api.patch(`${interactionPrefix}/identifiers`, {
      json: payload,
    });
    await api.patch(`${interactionPrefix}/profile`, {
      json: { connectorId: socialToBind },
    });
  } else {
    await api.put(`${interactionPrefix}`, {
      json: {
        event: InteractionEvent.SignIn,
        identifier: payload,
      },
    });
  }

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

export type SendVerificationCodePayload = { email: string } | { phone: string };

export const putInteraction = async (event: InteractionEvent) =>
  api.put(`${interactionPrefix}`, { json: { event } });

export const sendVerificationCode = async (payload: SendVerificationCodePayload) => {
  await api.post(`${interactionPrefix}/${verificationPath}/verification-code`, { json: payload });

  return { success: true };
};

export const signInWithVerificationCodeIdentifier = async (
  payload: EmailVerificationCodePayload | PhoneVerificationCodePayload,
  socialToBind?: string
) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: payload,
  });

  await api.patch(`${interactionPrefix}/profile`, {
    json: { connectorId: socialToBind },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const addProfileWithVerificationCodeIdentifier = async (
  payload: EmailVerificationCodePayload | PhoneVerificationCodePayload,
  socialToBind?: string
) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: payload,
  });

  const { verificationCode, ...identifier } = payload;

  await api.patch(`${interactionPrefix}/profile`, {
    json: identifier,
  });

  await api.patch(`${interactionPrefix}/profile`, {
    json: { connectorId: socialToBind },
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

export const addProfile = async (
  payload: { username: string } | { password: string },
  socialToBind?: string
) => {
  await api.patch(`${interactionPrefix}/profile`, { json: payload });

  await api.patch(`${interactionPrefix}/profile`, {
    json: { connectorId: socialToBind },
  });

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

export const bindSocialRelatedUser = async (payload: SocialIdentityPayload) => {
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
