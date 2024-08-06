import {
  type IdentificationApiPayload,
  InteractionEvent,
  type PasswordVerificationPayload,
  SignInIdentifier,
  type UpdateProfileApiPayload,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import api from './api';

const prefix = '/api/experience';

const experienceRoutes = Object.freeze({
  prefix,
  identification: `${prefix}/identification`,
  verification: `${prefix}/verification`,
  profile: `${prefix}/profile`,
  mfa: `${prefix}/profile/mfa`,
});

type VerificationResponse = {
  verificationId: string;
};

type SubmitInteractionResponse = {
  redirectTo: string;
};

export const initInteraction = async (interactionEvent: InteractionEvent) =>
  api.put(`${experienceRoutes.prefix}`, {
    json: {
      interactionEvent,
    },
  });

const identifyUser = async (payload: IdentificationApiPayload = {}) =>
  api.post(experienceRoutes.identification, { json: payload });

const submitInteraction = async () =>
  api.post(`${experienceRoutes.prefix}/submit`).json<SubmitInteractionResponse>();

const updateProfile = async (payload: UpdateProfileApiPayload) => {
  await api.post(experienceRoutes.profile, { json: payload });
};

const updateInteractionEvent = async (interactionEvent: InteractionEvent) =>
  api.put(`${experienceRoutes.prefix}/interaction-event`, {
    json: {
      interactionEvent,
    },
  });

const identifyAndSubmitInteraction = async (payload?: IdentificationApiPayload) => {
  await identifyUser(payload);
  return submitInteraction();
};

// Password APIs
export const signInWithPasswordIdentifier = async (payload: PasswordVerificationPayload) => {
  await initInteraction(InteractionEvent.SignIn);

  const { verificationId } = await api
    .post(`${experienceRoutes.verification}/password`, {
      json: payload,
    })
    .json<VerificationResponse>();

  return identifyAndSubmitInteraction({ verificationId });
};

export const registerWithUsername = async (username: string) => {
  await initInteraction(InteractionEvent.Register);

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
    .post(`${experienceRoutes.verification}/verification-code`, {
      json: {
        interactionEvent,
        identifier,
      },
    })
    .json<VerificationResponse>();

const verifyVerificationCode = async (json: VerificationCodePayload) =>
  api
    .post(`${experienceRoutes.verification}/verification-code/verify`, {
      json,
    })
    .json<VerificationResponse>();

export const identifyWithVerificationCode = async (json: VerificationCodePayload) => {
  const { verificationId } = await verifyVerificationCode(json);
  return identifyAndSubmitInteraction({ verificationId });
};

export const registerWithVerifiedIdentifier = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.Register);
  return identifyAndSubmitInteraction({ verificationId });
};

export const signInWithVerifiedIdentifier = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.SignIn);
  return identifyAndSubmitInteraction({ verificationId });
};

// Profile APIs

export const updateProfileWithVerificationCode = async (json: VerificationCodePayload) => {
  const { verificationId } = await verifyVerificationCode(json);

  const {
    identifier: { type },
  } = json;

  await updateProfile({
    type,
    verificationId,
  });

  return submitInteraction();
};

export const resetPassword = async (password: string) => {
  await api.put(`${experienceRoutes.profile}/password`, {
    json: {
      password,
    },
  });

  return submitInteraction();
};
