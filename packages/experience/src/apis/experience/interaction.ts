import {
  type InteractionEvent,
  type IdentificationApiPayload,
  type UpdateProfileApiPayload,
} from '@logto/schemas';

import api from '../api';

import { experienceRoutes } from './const';

type SubmitInteractionResponse = {
  redirectTo: string;
};

export const initInteraction = async (interactionEvent: InteractionEvent) =>
  api.put(`${experienceRoutes.prefix}`, {
    json: {
      interactionEvent,
    },
  });

export const identifyUser = async (payload: IdentificationApiPayload = {}) =>
  api.post(experienceRoutes.identification, { json: payload });

export const submitInteraction = async () =>
  api.post(`${experienceRoutes.prefix}/submit`).json<SubmitInteractionResponse>();

export const _updateProfile = async (payload: UpdateProfileApiPayload) =>
  api.post(experienceRoutes.profile, { json: payload });

export const updateInteractionEvent = async (interactionEvent: InteractionEvent) =>
  api.put(`${experienceRoutes.prefix}/interaction-event`, {
    json: {
      interactionEvent,
    },
  });

export const identifyAndSubmitInteraction = async (payload?: IdentificationApiPayload) => {
  await identifyUser(payload);
  return submitInteraction();
};
