import api from './api.js';

export const ssoPath = 'single-sign-on';

export const getSsoAuthorizationUrl = async (
  cookie: string,
  data: {
    connectorId: string;
    state: string;
    redirectUri: string;
  }
) => {
  const { connectorId, ...payload } = data;
  return api
    .post(`interaction/${ssoPath}/${connectorId}/authentication`, {
      headers: { cookie },
      json: payload,
      followRedirect: false,
    })
    .json<{ redirectTo: string }>();
};

export const getSsoConnectorsByEmail = async (
  cookie: string,
  data: {
    email: string;
  }
) => {
  return api
    .get(`interaction/${ssoPath}/connectors`, {
      headers: { cookie },
      searchParams: {
        email: data.email,
      },
    })
    .json<Array<{ id: string; ssoOnly: boolean }>>();
};
