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
