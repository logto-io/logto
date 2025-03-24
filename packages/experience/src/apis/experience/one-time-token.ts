import { InteractionEvent, type OneTimeTokenVerificationVerifyPayload } from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes, type VerificationResponse } from './const';
import { initInteraction } from './interaction';

export const registerWithOneTimeToken = async (payload: OneTimeTokenVerificationVerifyPayload) => {
  await initInteraction(InteractionEvent.Register);

  return api
    .post(`${experienceApiRoutes.verification}/one-time-token/verify`, {
      json: payload,
    })
    .json<VerificationResponse>();
};
