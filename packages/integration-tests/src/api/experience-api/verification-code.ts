import { type InteractionEvent, type VerificationCodeIdentifier } from '@logto/schemas';

import api from '../api.js';

import { experienceVerificationApiRoutesPrefix } from './const.js';

export const sendVerificationCode = async (
  cookie: string,
  payload: {
    identifier: VerificationCodeIdentifier;
    interactionEvent: InteractionEvent;
  }
) =>
  api
    .post(`${experienceVerificationApiRoutesPrefix}/verification-code`, {
      headers: { cookie },
      json: payload,
    })
    .json<{ verificationId: string }>();

export const verifyVerificationCode = async (
  cookie: string,
  payload: {
    identifier: VerificationCodeIdentifier;
    verificationId: string;
    code: string;
  }
) =>
  api
    .post(`${experienceVerificationApiRoutesPrefix}/verification-code/verify`, {
      headers: { cookie },
      json: payload,
    })
    .json<{ verificationId: string }>();
