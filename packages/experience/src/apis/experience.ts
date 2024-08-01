import {
  type IdentificationApiPayload,
  InteractionEvent,
  type InteractionIdentifier,
  type PasswordVerificationPayload,
  SignInIdentifier,
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

const identifyUser = async (payload: IdentificationApiPayload) =>
  api.post(experienceRoutes.identification, { json: payload });

const submitInteraction = async () =>
  api.post(`${experienceRoutes.prefix}/submit`).json<SubmitInteractionResponse>();

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

  // Expect to throw
  await api.post(`${experienceRoutes.verification}/new-password-identity`, {
    json: {
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
    },
  });
};

export const registerPassword = async (identifier: InteractionIdentifier, password: string) => {
  const { verificationId } = await api
    .post(`${experienceRoutes.verification}/new-password-identity`, {
      json: {
        identifier,
        password,
      },
    })
    .json<VerificationResponse>();

  await identifyUser({ verificationId });

  return submitInteraction();
};
