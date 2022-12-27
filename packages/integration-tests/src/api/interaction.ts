import type { InteractionEvent, IdentifierPayload, Profile } from '@logto/schemas';

import api from './api.js';

export type RedirectResponse = {
  redirectTo: string;
};

export type interactionPayload = {
  event: InteractionEvent;
  identifier?: IdentifierPayload;
  profile?: Profile;
};

export const putInteraction = async (cookie: string, payload: interactionPayload) =>
  api
    .put('interaction', {
      headers: { cookie },
      json: payload,
      followRedirect: false,
    })
    .json();

export const putInteractionEvent = async (cookie: string, payload: { event: InteractionEvent }) =>
  api
    .put('interaction/event', { headers: { cookie }, json: payload, followRedirect: false })
    .json();

export const patchInteractionIdentifiers = async (cookie: string, payload: IdentifierPayload) =>
  api
    .patch('interaction/identifiers', {
      headers: { cookie },
      json: payload,
      followRedirect: false,
    })
    .json();

export const patchInteractionProfile = async (cookie: string, payload: Profile) =>
  api
    .patch('interaction/profile', {
      headers: { cookie },
      json: payload,
      followRedirect: false,
    })
    .json();

export const putInteractionProfile = async (cookie: string, payload: Profile) =>
  api
    .put('interaction/profile', {
      headers: { cookie },
      json: payload,
      followRedirect: false,
    })
    .json();

export const deleteInteractionProfile = async (cookie: string) =>
  api
    .delete('interaction/profile', {
      headers: { cookie },
      followRedirect: false,
    })
    .json();

export const submitInteraction = async (cookie: string) =>
  api
    .post('interaction/submit', { headers: { cookie }, followRedirect: false })
    .json<RedirectResponse>();

export type VerificationPasscodePayload =
  | {
      event: InteractionEvent;
      email: string;
    }
  | { event: InteractionEvent; phone: string };

export const sendVerificationPasscode = async (
  cookie: string,
  payload: VerificationPasscodePayload
) =>
  api.post('interaction/verification/passcode', {
    headers: { cookie },
    json: payload,
    followRedirect: false,
  });

export type SocialAuthorizationUriPayload = {
  connectorId: string;
  state: string;
  redirectUri: string;
};

export const createSocialAuthorizationUri = async (
  cookie: string,
  payload: SocialAuthorizationUriPayload
) =>
  api.post('interaction/verification/social-authorization-uri', {
    headers: { cookie },
    json: payload,
    followRedirect: false,
  });
