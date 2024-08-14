import {
  type IdentificationApiPayload,
  InteractionEvent,
  type PasswordVerificationPayload,
  SignInIdentifier,
  type UpdateProfileApiPayload,
} from '@logto/schemas';

import api from './api';

const prefix = '/api/experience';

const experienceApiRoutes = Object.freeze({
  prefix,
  identification: `${prefix}/identification`,
  submit: `${prefix}/submit`,
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
  api.put(`${experienceApiRoutes.prefix}`, {
    json: {
      interactionEvent,
    },
  });

const identifyUser = async (payload: IdentificationApiPayload = {}) =>
  api.post(experienceApiRoutes.identification, { json: payload });

const submitInteraction = async () =>
  api.post(`${experienceApiRoutes.submit}`).json<SubmitInteractionResponse>();

const updateProfile = async (payload: UpdateProfileApiPayload) => {
  await api.post(experienceApiRoutes.profile, { json: payload });
};

export const signInWithPasswordIdentifier = async (payload: PasswordVerificationPayload) => {
  await initInteraction(InteractionEvent.SignIn);

  const { verificationId } = await api
    .post(`${experienceApiRoutes.verification}/password`, {
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
