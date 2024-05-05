import type {
  InteractionEvent,
  IdentifierPayload,
  Profile,
  RequestVerificationCodePayload,
  BindMfaPayload,
  VerifyMfaPayload,
  ConsentInfoResponse,
} from '@logto/schemas';
import { type KyInstance } from 'ky';

import api from './api.js';

export type RedirectResponse = {
  redirectTo: string;
};

export type InteractionPayload = {
  event: InteractionEvent;
  identifier?: IdentifierPayload;
  profile?: Profile;
};

export const putInteraction = async (cookie: string, payload: InteractionPayload) =>
  api
    .put('interaction', {
      headers: { cookie },
      json: payload,
    })
    .json();

export const deleteInteraction = async (cookie: string) =>
  api
    .delete('interaction', {
      headers: { cookie },
    })
    .json();

export const putInteractionEvent = async (cookie: string, payload: { event: InteractionEvent }) =>
  api.put('interaction/event', { headers: { cookie }, json: payload, redirect: 'manual' }).json();

export const patchInteractionIdentifiers = async (cookie: string, payload: IdentifierPayload) =>
  api
    .patch('interaction/identifiers', {
      headers: { cookie },
      json: payload,
    })
    .json();

export const patchInteractionProfile = async (cookie: string, payload: Profile) =>
  api
    .patch('interaction/profile', {
      headers: { cookie },
      json: payload,
    })
    .json();

export const putInteractionProfile = async (cookie: string, payload: Profile) =>
  api
    .put('interaction/profile', {
      headers: { cookie },
      json: payload,
    })
    .json();

export const postInteractionBindMfa = async (cookie: string, payload: BindMfaPayload) =>
  api
    .post('interaction/bind-mfa', {
      headers: { cookie },
      json: payload,
    })
    .json();

export const putInteractionMfa = async (cookie: string, payload: VerifyMfaPayload) =>
  api
    .put('interaction/mfa', {
      headers: { cookie },
      json: payload,
    })
    .json();

export const deleteInteractionProfile = async (cookie: string) =>
  api
    .delete('interaction/profile', {
      headers: { cookie },
    })
    .json();

export const submitInteraction = async (api: KyInstance, cookie: string) =>
  api
    .post('interaction/submit', { headers: { cookie }, redirect: 'manual' })
    .json<RedirectResponse>();

export const sendVerificationCode = async (
  cookie: string,
  payload: RequestVerificationCodePayload
) =>
  api.post('interaction/verification/verification-code', {
    headers: { cookie },
    json: payload,
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
  });

export const initTotp = async (cookie: string) =>
  api
    .post('interaction/verification/totp', {
      headers: { cookie },
      json: {},
      redirect: 'manual',
      throwHttpErrors: false,
    })
    .json<{ secret: string }>();

export const skipMfaBinding = async (cookie: string) =>
  api.put('interaction/mfa-skipped', {
    headers: { cookie },
    json: {
      mfaSkipped: true,
    },
  });

export const consent = async (cookie: string, payload: { organizationIds?: string[] } = {}) =>
  api
    .post('interaction/consent', {
      headers: {
        cookie,
      },
      redirect: 'manual',
      throwHttpErrors: false,
      json: payload,
    })
    .json<RedirectResponse>();

export const getConsentInfo = async (cookie: string) =>
  api
    .get('interaction/consent', {
      headers: { cookie },
    })
    .json<ConsentInfoResponse>();

export const createSingleSignOnAuthorizationUri = async (
  cookie: string,
  payload: SocialAuthorizationUriPayload
) =>
  api.post('interaction/verification/sso-authorization-uri', {
    headers: { cookie },
    json: payload,
  });
