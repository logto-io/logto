import {
  type IdentificationApiPayload,
  InteractionEvent,
  type PasswordVerificationPayload,
  SignInIdentifier,
  type SocialVerificationCallbackPayload,
  type UpdateProfileApiPayload,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { type ContinueFlowInteractionEvent } from '@/types';

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

const _updateProfile = async (payload: UpdateProfileApiPayload) =>
  api.post(experienceRoutes.profile, { json: payload });

const updateInteractionEvent = async (interactionEvent: InteractionEvent) =>
  api.put(`${experienceRoutes.prefix}/interaction-event`, {
    json: {
      interactionEvent,
    },
  });

export const identifyAndSubmitInteraction = async (payload?: IdentificationApiPayload) => {
  await identifyUser(payload);
  return submitInteraction();
};

export const registerWithVerifiedIdentifier = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.Register);
  return identifyAndSubmitInteraction({ verificationId });
};

export const signInWithVerifiedIdentifier = async (verificationId: string) => {
  await updateInteractionEvent(InteractionEvent.SignIn);
  return identifyAndSubmitInteraction({ verificationId });
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

  return _updateProfile({ type: SignInIdentifier.Username, value: username });
};

export const continueRegisterWithPassword = async (password: string) => {
  await _updateProfile({ type: 'password', value: password });

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

// Profile APIs

export const updateProfileWithVerificationCode = async (
  json: VerificationCodePayload,
  interactionEvent?: ContinueFlowInteractionEvent
) => {
  const { verificationId } = await verifyVerificationCode(json);

  const {
    identifier: { type },
  } = json;

  await _updateProfile({
    type,
    verificationId,
  });

  if (interactionEvent === InteractionEvent.Register) {
    await identifyUser();
  }

  return submitInteraction();
};

type UpdateProfilePayload = {
  type: SignInIdentifier.Username | 'password';
  value: string;
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
  interactionEvent: ContinueFlowInteractionEvent
) => {
  await _updateProfile(payload);

  if (interactionEvent === InteractionEvent.Register) {
    await identifyUser();
  }

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

// Social and SSO APIs

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
    .json<{ connectorIds: string[] }>();

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

  return identifyAndSubmitInteraction({ verificationId: payload.verificationId });
};

export const signInAndLinkWithSso = async (
  verificationId: string,
  socialVerificationid: string
) => {
  await updateInteractionEvent(InteractionEvent.SignIn);
  await identifyUser({ verificationId });
  await _updateProfile({ type: 'social', verificationId: socialVerificationid });
  return submitInteraction();
};
