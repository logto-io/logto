import api from './api.js';

export const ssoPath = 'single-sign-on';

export const postSamlAssertion = async (data: {
  connectorId: string;
  RelayState: string;
  SAMLResponse: string;
}) => {
  const { connectorId, ...payload } = data;
  return api
    .post(`authn/${ssoPath}/saml/${connectorId}`, {
      json: payload,
    })
    .json();
};
