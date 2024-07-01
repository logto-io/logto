import api from '../api.js';

import { experienceVerificationApiRoutesPrefix } from './const.js';

export const getSocialAuthorizationUri = async (
  cookie: string,
  connectorId: string,
  payload: {
    redirectUri: string;
    state: string;
  }
) =>
  api
    .post(`${experienceVerificationApiRoutesPrefix}/social/${connectorId}/authorization-uri`, {
      headers: { cookie },
      json: payload,
    })
    .json<{ authorizationUri: string; verificationId: string }>();

export const verifySocialAuthorization = async (
  cookie: string,
  connectorId: string,
  payload: {
    verificationId: string;
    connectorData: Record<string, unknown>;
  }
) =>
  api
    .post(`${experienceVerificationApiRoutesPrefix}/social/${connectorId}/verify`, {
      headers: { cookie },
      json: payload,
    })
    .json<{ verificationId: string }>();
