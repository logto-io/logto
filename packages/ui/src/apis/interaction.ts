/* istanbul ignore file */

import { InteractionEvent } from '@logto/schemas';
import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  PhonePasswordPayload,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import api from './api';

const interactionPrefix = '/api/interaction';

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
