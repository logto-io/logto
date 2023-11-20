import api from './api';

const ssoPrefix = '/api/interaction/single-sign-on';

type Response = {
  redirectTo: string;
};

export const getSingleSignOnConnectors = async (email: string) =>
  api
    .get(`${ssoPrefix}/connectors`, {
      searchParams: {
        email,
      },
    })
    .json<string[]>();

export const getSingleSignOnUrl = async (
  connectorId: string,
  state: string,
  redirectUri: string
) => {
  const { redirectTo } = await api
    .post(`${ssoPrefix}/${connectorId}/authorization-url`, {
      json: {
        state,
        redirectUri,
      },
    })
    .json<Response>();

  return redirectTo;
};

export const singleSignOnAuthorization = async (connectorId: string, payload: unknown) =>
  api
    .post(`${ssoPrefix}/${connectorId}/authentication`, {
      json: payload,
    })
    .json<Response>();
