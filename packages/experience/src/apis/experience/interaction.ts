import {
  type InteractionEvent,
  type IdentificationApiPayload,
  type UpdateProfileApiPayload,
} from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';

type SubmitInteractionResponse = {
  redirectTo: string;
};

export const initInteraction = async (interactionEvent: InteractionEvent, captchaToken?: string) =>
  api.put(`${experienceApiRoutes.prefix}`, {
    json: {
      interactionEvent,
      captchaToken,
    },
  });

export const identifyUser = async (payload: IdentificationApiPayload = {}) =>
  api.post(experienceApiRoutes.identification, { json: payload });

export const submitInteraction = async () =>
  api.post(experienceApiRoutes.submit).json<SubmitInteractionResponse>();

export const setTrustedDeviceOptInDecision = async (trusted: boolean) => {
  await api.post(`${experienceApiRoutes.profile}/trusted-device`, {
    json: { trusted },
  });

  return submitInteraction();
};

export const updateProfile = async (payload: UpdateProfileApiPayload) =>
  api.post(experienceApiRoutes.profile, { json: payload });

export const updateInteractionEvent = async (interactionEvent: InteractionEvent) =>
  api.put(`${experienceApiRoutes.prefix}/interaction-event`, {
    json: {
      interactionEvent,
    },
  });

export const identifyAndSubmitInteraction = async (payload?: IdentificationApiPayload) => {
  await identifyUser(payload);
  return submitInteraction();
};

/**
 * Finishes the interaction with an `access_denied` OAuth error. The returned `redirectTo`
 * resumes the OIDC flow and sends the user agent back to the client's redirect URI with the
 * error attached.
 */
export const abortInteraction = async (reason?: string) =>
  api.post(experienceApiRoutes.abort, { json: { reason } }).json<SubmitInteractionResponse>();

export type DirectSignInResponse = {
  /** The `direct_sign_in` value of the current authorization request, e.g. `social:google`. */
  directSignIn?: string;
};

/**
 * Read whether the current interaction was started by a `direct_sign_in` authorization request.
 * The value is scoped to the interaction on the server and works even before the experience
 * interaction is initialized.
 */
export const getDirectSignIn = async () =>
  api.get(experienceApiRoutes.directSignIn).json<DirectSignInResponse>();
