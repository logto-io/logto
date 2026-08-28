import {
  type InteractionEvent,
  type IdentificationApiPayload,
  type UpdateProfileApiPayload,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import api from '../api';

import { experienceApiRoutes } from './const';

type SubmitInteractionResponse = {
  redirectTo: string;
};

type SubmitInteractionOptions = {
  createTrustedDevice?: boolean;
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

const requestTrustedDeviceCreation = async () =>
  api.post(`${experienceApiRoutes.mfa}/trusted-device`);

export const submitInteraction = async ({
  createTrustedDevice = false,
}: SubmitInteractionOptions = {}) => {
  if (createTrustedDevice) {
    await trySafe(requestTrustedDeviceCreation);
  }

  return api.post(experienceApiRoutes.submit).json<SubmitInteractionResponse>();
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
