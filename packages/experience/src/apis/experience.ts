import {
  type IdentificationApiPayload,
  InteractionEvent,
  type PasswordVerificationPayload,
  SignInIdentifier,
  type UpdateProfileApiPayload,
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

const initInteraction = async (interactionEvent: InteractionEvent) =>
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

export const signInWithPasswordIdentifier = async (payload: PasswordVerificationPayload) => {
  await initInteraction(InteractionEvent.SignIn);

  const { verificationId } = await api
    .post(`${experienceRoutes.verification}/password`, {
      json: payload,
    })
    .json<VerificationResponse>();

  await identifyUser({ verificationId });

  return submitInteraction();
};

export const registerWithUsername = async (username: string) => {
  await initInteraction(InteractionEvent.Register);

  return updateProfile({ type: SignInIdentifier.Username, value: username });
};

export const continueRegisterWithPassword = async (password: string) => {
  await updateProfile({ type: 'password', value: password });

  await identifyUser();

  return submitInteraction();
};
