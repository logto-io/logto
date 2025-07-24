import {
  InteractionEvent,
  type PasswordVerificationPayload,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { type ContinueFlowInteractionEvent } from '@/types';

import api from '../api';

import { experienceApiRoutes, type VerificationResponse } from './const';
import {
  initInteraction,
  identifyUser,
  submitInteraction,
  updateInteractionEvent,
  updateProfile,
  identifyAndSubmitInteraction,
} from './interaction';

export {
  initInteraction,
  submitInteraction,
  identifyUser,
  identifyAndSubmitInteraction,
} from './interaction';

export * from './mfa';
export * from './social';
export * from './one-time-token';

/**
 * For sign-in flow user identity not found error handling use.
 *
 * If the identity is not found, but the verification record is verified,
 * allow the user registration with the verified identifier.
 *
 * Supported verification types:
 * - email verification code
 * - phone number verification code
 * - social sign-in
 * - SSO sign-in
 */
export const registerWithVerifiedIdentifier = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.Register);
  return identifyAndSubmitInteraction({ verificationId });
};

/**
 * For sign-up flow user identifier already exists error handling user.
 *
 * If the identifier has been registered by an existing user,
 * allow the user to sign-in with the verified identifier directly.
 *
 * Supported verification types:
 * - email verification code
 * - phone number verification code
 */
export const signInWithVerifiedIdentifier = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.SignIn);
  return identifyAndSubmitInteraction({ verificationId });
};

// Password APIs
export const signInWithPasswordIdentifier = async (
  payload: PasswordVerificationPayload,
  captchaToken?: string
) => {
  await initInteraction(InteractionEvent.SignIn, captchaToken);

  const { verificationId } = await api
    .post(`${experienceApiRoutes.verification}/password`, {
      json: payload,
    })
    .json<VerificationResponse>();

  return identifyAndSubmitInteraction({ verificationId });
};

export const registerWithUsername = async (username: string, captchaToken?: string) => {
  await initInteraction(InteractionEvent.Register, captchaToken);

  return updateProfile({ type: SignInIdentifier.Username, value: username });
};

export const continueRegisterWithPassword = async (password: string) => {
  await updateProfile({ type: 'password', value: password });

  return identifyAndSubmitInteraction();
};

// Verification code APIs
type VerificationCodePayload = {
  identifier: VerificationCodeIdentifier;
  code: string;
  verificationId: string;
};

export const sendVerificationCode = async (
  interactionEvent: InteractionEvent,
  identifier: VerificationCodeIdentifier
) =>
  api
    .post(`${experienceApiRoutes.verification}/verification-code`, {
      json: {
        interactionEvent,
        identifier,
      },
    })
    .json<VerificationResponse>();

const verifyVerificationCode = async (json: VerificationCodePayload) =>
  api
    .post(`${experienceApiRoutes.verification}/verification-code/verify`, {
      json,
    })
    .json<VerificationResponse>();

export const identifyWithVerificationCode = async (json: VerificationCodePayload) => {
  const { verificationId } = await verifyVerificationCode(json);
  return identifyAndSubmitInteraction({ verificationId });
};

// Profile APIs

export const updateProfileWithVerificationCode = async (
  json: VerificationCodePayload,
  interactionEvent?: ContinueFlowInteractionEvent
) => {
  const { verificationId } = await verifyVerificationCode(json);

  const {
    identifier: { type },
  } = json;

  await updateProfile({
    type,
    verificationId,
  });

  if (interactionEvent === InteractionEvent.Register) {
    await identifyUser();
  }

  return submitInteraction();
};

type UpdateProfilePayload =
  | {
      type: SignInIdentifier.Username | 'password';
      value: string;
    }
  | {
      type: 'extraProfile';
      values: Record<string, unknown>;
    };

export const fulfillProfile = async (
  payload: UpdateProfilePayload,
  interactionEvent: ContinueFlowInteractionEvent
) => {
  await updateProfile(payload);

  if (interactionEvent === InteractionEvent.Register) {
    await identifyUser();
  }

  return submitInteraction();
};

export const resetPassword = async (password: string) => {
  await api.put(`${experienceApiRoutes.profile}/password`, {
    json: {
      password,
    },
  });

  return submitInteraction();
};
