import { InteractionEvent, type GoogleOneTapVerificationVerifyPayload } from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes, type GoogleOneTapVerificationResponse } from './const';
import { initInteraction } from './interaction';

export const verifyGoogleOneTapCredential = async (
  payload: GoogleOneTapVerificationVerifyPayload
) => {
  await initInteraction(InteractionEvent.SignIn);

  return api
    .post(`${experienceApiRoutes.verification}/google-one-tap/verify`, {
      json: payload,
    })
    .json<GoogleOneTapVerificationResponse>();
};
