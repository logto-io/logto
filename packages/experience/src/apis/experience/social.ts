import { InteractionEvent, type SocialVerificationCallbackPayload } from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes, type VerificationResponse } from './const';
import {
  identifyAndSubmitInteraction,
  updateInteractionEvent,
  identifyUser,
  submitInteraction,
  updateProfile,
} from './interaction';

export const getSocialAuthorizationUrl = async (
  connectorId: string,
  state: string,
  redirectUri: string
) =>
  api
    .post(`${experienceApiRoutes.verification}/social/${connectorId}/authorization-uri`, {
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

export const verifySocialVerification = async (
  connectorId: string,
  payload: SocialVerificationCallbackPayload
) =>
  api
    .post(`${experienceApiRoutes.verification}/social/${connectorId}/verify`, {
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
    .get(`${experienceApiRoutes.prefix}/sso-connectors`, {
      searchParams: {
        email,
      },
    })
    .json<{ connectorIds: string[] }>();

export const getSsoAuthorizationUrl = async (connectorId: string, payload: unknown) =>
  api
    .post(`${experienceApiRoutes.verification}/sso/${connectorId}/authorization-uri`, {
      json: payload,
    })
    .json<
      VerificationResponse & {
        authorizationUri: string;
      }
    >();

export const verifySsoVerification = async (
  connectorId: string,
  payload: SocialVerificationCallbackPayload & { verificationId: string }
) =>
  api.post(`${experienceApiRoutes.verification}/sso/${connectorId}/verify`, {
    json: payload,
  });

export const signInWithSso = async (
  connectorId: string,
  payload: SocialVerificationCallbackPayload & { verificationId: string }
) => {
  await verifySsoVerification(connectorId, payload);

  return identifyAndSubmitInteraction({ verificationId: payload.verificationId });
};

export const signInAndLinkWithSocial = async (
  verificationId: string,
  socialVerificationid: string
) => {
  await updateInteractionEvent(InteractionEvent.SignIn);
  await identifyUser({ verificationId });
  await updateProfile({ type: 'social', verificationId: socialVerificationid });
  return submitInteraction();
};
