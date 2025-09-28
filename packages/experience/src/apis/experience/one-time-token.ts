import { InteractionEvent, type OneTimeTokenVerificationVerifyPayload } from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes, type VerificationResponse } from './const';
import { initInteraction } from './interaction';

export const signInWithOneTimeToken = async (payload: OneTimeTokenVerificationVerifyPayload) => {
  await initInteraction(InteractionEvent.SignIn);

  return api
    .post(`${experienceApiRoutes.verification}/one-time-token/verify`, {
      json: payload,
    })
    .json<VerificationResponse>();
};
