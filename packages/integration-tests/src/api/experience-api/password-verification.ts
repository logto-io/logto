import { type PasswordVerificationPayload } from '@logto/schemas';

import api from '../api.js';

import { experienceVerificationApiRoutesPrefix } from './const.js';

type VerificationResponse = {
  verificationId: string;
};

export const createPasswordVerification = async (
  cookie: string,
  payload: PasswordVerificationPayload
) =>
  api
    .post(`${experienceVerificationApiRoutesPrefix}/password`, {
      headers: { cookie },
      json: payload,
    })
    .json<VerificationResponse>();
