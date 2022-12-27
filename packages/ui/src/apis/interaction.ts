/* istanbul ignore file */

import { InteractionEvent } from '@logto/schemas';
import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  PhonePasswordPayload,
  EmailPasscodePayload,
  PhonePasscodePayload,
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
  await api.put(`${interactionPrefix}`, {
    json: {
      event: InteractionEvent.SignIn,
      identifier: payload,
    },
  });

  if (socialToBind) {
    // TODO: bind social account
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

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export type SendPasscodePayload = { email: string } | { phone: string };

export const putInteraction = async (event: InteractionEvent) =>
  api.put(`${interactionPrefix}`, { json: { event } });

export const sendPasscode = async (payload: SendPasscodePayload) => {
  await api.post(`${interactionPrefix}/${verificationPath}/passcode`, { json: payload });

  return { success: true };
};

export const signInWithPasscodeIdentifier = async (
  payload: EmailPasscodePayload | PhonePasscodePayload,
  socialToBind?: string
) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: {
      identifier: payload,
    },
  });

  if (socialToBind) {
    // TODO: bind social account
  }

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const addProfileWithPasscodeIdentifier = async (
  payload: EmailPasscodePayload | PhonePasscodePayload,
  socialToBind?: string
) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: {
      identifier: payload,
    },
  });

  const { passcode, ...identifier } = payload;

  await api.patch(`${interactionPrefix}/profile`, {
    json: identifier,
  });

  if (socialToBind) {
    // TODO: bind social account
  }

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const verifyForgotPasswordPasscodeIdentifier = async (
  payload: EmailPasscodePayload | PhonePasscodePayload
) => {
  await api.patch(`${interactionPrefix}/identifiers`, {
    json: {
      identifier: payload,
    },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const signInWithVerifierIdentifier = async () => {
  await api.delete(`${interactionPrefix}/profile`);

  await api.put(`${interactionPrefix}/event`, {
    json: {
      event: InteractionEvent.SignIn,
    },
  });

  return api.post(`${interactionPrefix}/submit`).json<Response>();
};

export const registerWithVerifiedIdentifier = async (payload: SendPasscodePayload) => {
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
