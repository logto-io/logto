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
  callbackUri: string
) => {
  const { redirectTo } = await api
    .post(`${ssoPrefix}/${connectorId}/authorization-url`, {
      json: {
        state,
        callbackUri,
      },
    })
    .json<Response>();

  return redirectTo;
};
