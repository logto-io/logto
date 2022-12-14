import type { Event, IdentifierPayload, Profile } from '@logto/schemas';

import api from './api.js';

export type RedirectResponse = {
  redirectTo: string;
};

export type interactionPayload = {
  event: Event;
  identifier?: IdentifierPayload;
  profile?: Profile;
};

export const putInteraction = async (payload: interactionPayload, cookie: string) =>
  api
    .put('interaction', {
      headers: { cookie },
      json: payload,
      followRedirect: false,
    })
    .json<RedirectResponse>();

export const patchInteraction = async (payload: interactionPayload, cookie: string) =>
  api
    .patch('interaction', {
      headers: { cookie },
      json: payload,
      followRedirect: false,
    })
    .json<RedirectResponse>();

export type VerificationPasscodePayload =
  | {
      event: Event;
      email: string;
    }
  | { event: Event; phone: string };

export const sendVerificationPasscode = async (
  payload: VerificationPasscodePayload,
  cookie: string
) =>
  api.post('verification/passcode', {
    headers: { cookie },
    json: payload,
    followRedirect: false,
  });
