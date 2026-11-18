import { InteractionEvent } from '@logto/schemas';

import { type VerificationCodeIdentifier } from '@/types';

import api from '../api';

import { experienceApiRoutes, type VerificationResponse } from './const';

export type SubjectVerificationCodePayload = {
  type: VerificationCodeIdentifier;
  code: string;
  verificationId: string;
};

/**
 * Send a verification code to the subject's primary email or phone without transmitting the
 * raw identifier from the browser.
 */
export const sendSubjectVerificationCode = async (type: VerificationCodeIdentifier) =>
  api
    .post(`${experienceApiRoutes.verification}/verification-code`, {
      json: {
        interactionEvent: InteractionEvent.SignIn,
        identifier: { type },
      },
    })
    .json<VerificationResponse>();

/**
 * Verify a subject-bound primary verification code and return the verified `verificationId`.
 */
export const verifySubjectVerificationCode = async ({
  type,
  code,
  verificationId,
}: SubjectVerificationCodePayload) =>
  api
    .post(`${experienceApiRoutes.verification}/verification-code/verify`, {
      json: {
        identifier: { type },
        code,
        verificationId,
      },
    })
    .json<VerificationResponse>();
