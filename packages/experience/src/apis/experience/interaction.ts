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

export const initInteraction = async (interactionEvent: InteractionEvent) =>
  api.put(`${experienceApiRoutes.prefix}`, {
    json: {
      interactionEvent,
    },
  });

export const identifyUser = async (payload: IdentificationApiPayload = {}) =>
  api.post(experienceApiRoutes.identification, { json: payload });

export const submitInteraction = async () =>
  api.post(`${experienceApiRoutes.submit}`).json<SubmitInteractionResponse>();

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
