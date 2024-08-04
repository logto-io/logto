import {
  type IdentificationApiPayload,
  InteractionEvent,
  type InteractionIdentifier,
  type PasswordVerificationPayload,
  SignInIdentifier,
  type SocialVerificationCallbackPayload,
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

const identifyUser = async (payload: IdentificationApiPayload) =>
  api.post(experienceRoutes.identification, { json: payload });

const submitInteraction = async () =>
  api.post(`${experienceRoutes.prefix}/submit`).json<SubmitInteractionResponse>();

const updateInteractionEvent = async (interactionEvent: InteractionEvent) =>
  api.put(`${experienceRoutes.prefix}/interaction-event`, {
    json: {
      interactionEvent,
    },
  });

export const identifyAndSubmitInteraction = async (verificationId: string) => {
  await identifyUser({ verificationId });
  return submitInteraction();
};

const updateProfile = async (payload: UpdateProfileApiPayload) => {
  await api.post(experienceRoutes.profile, { json: payload });
  return submitInteraction();
};

export const signInWithPasswordIdentifier = async (payload: PasswordVerificationPayload) => {
  await initInteraction(InteractionEvent.SignIn);

  const { verificationId } = await api
    .post(`${experienceRoutes.verification}/password`, {
      json: payload,
    })
    .json<VerificationResponse>();

  return identifyAndSubmitInteraction(verificationId);
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

  return identifyAndSubmitInteraction(verificationId);
};

export const resetPassword = async (password: string) => {
  await api.put(`${experienceRoutes.profile}/password`, {
    json: {
      password,
    },
  });

  return submitInteraction();
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

type VerificationCodePayload = {
  identifier: VerificationCodeIdentifier;
  code: string;
  verificationId: string;
};

export const verifyVerificationCode = async (json: VerificationCodePayload) =>
  api
    .post(`${experienceRoutes.verification}/verification-code/verify`, {
      json,
    })
    .json<VerificationResponse>();

export const identifyWithVerificationCode = async (json: VerificationCodePayload) => {
  const { verificationId } = await verifyVerificationCode(json);
  return identifyAndSubmitInteraction(verificationId);
};

export const registerWithVerifiedIdentifier = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.Register);
  return identifyAndSubmitInteraction(verificationId);
};

export const signInWithVerifiedIdentifier = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.SignIn);
  return identifyAndSubmitInteraction(verificationId);
};

export const updateProfileWithVerificationCode = async (json: VerificationCodePayload) => {
  const { verificationId } = await verifyVerificationCode(json);

  const {
    identifier: { type },
  } = json;

  return updateProfile({
    type,
    verificationId,
  });
};

export const getSocialAuthorizationUrl = async (
  connectorId: string,
  state: string,
  redirectUri: string
) => {
  await initInteraction(InteractionEvent.SignIn);

  return api
    .post(`${experienceRoutes.verification}/social/${connectorId}/authorization-uri`, {
      json: {
        state,
        redirectUri,
      },
    })
    .json<
      VerificationResponse & {
        authorizationUri: string;
      }
    >();
};

export const verifySocialVerification = async (
  connectorId: string,
  payload: SocialVerificationCallbackPayload
) =>
  api
    .post(`${experienceRoutes.verification}/social/${connectorId}/verify`, {
      json: payload,
    })
    .json<VerificationResponse>();

export const bindSocialRelatedUser = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.SignIn);
  await identifyUser({ verificationId, linkSocialIdentity: true });
  return submitInteraction();
};

export const getSsoConnectors = async (email: string) =>
  api
    .get(`${experienceRoutes.verification}/sso/connectors`, {
      searchParams: {
        email,
      },
    })
    .json<string[]>();

export const getSsoAuthorizationUrl = async (connectorId: string, payload: unknown) => {
  await initInteraction(InteractionEvent.SignIn);

  return api
    .post(`${experienceRoutes.verification}/sso/${connectorId}/authorization-uri`, {
      json: payload,
    })
    .json<
      VerificationResponse & {
        authorizationUri: string;
      }
    >();
};

export const signInWithSso = async (
  connectorId: string,
  payload: SocialVerificationCallbackPayload & { verificationId: string }
) => {
  await api.post(`${experienceRoutes.verification}/sso/${connectorId}/verify`, {
    json: payload,
  });

  return identifyAndSubmitInteraction(payload.verificationId);
};
