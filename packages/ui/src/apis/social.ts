import api from './api';

export const invokeSocialSignIn = async (
  connectorId: string,
  state: string,
  redirectUri: string
) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post('/api/session/sign-in/social', {
      json: {
        connectorId,
        state,
        redirectUri,
      },
    })
    .json<Response>();
};

export const signInWithSocial = async (json: { connectorId: string; data: unknown }) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post('/api/session/sign-in/social/auth', {
      json,
    })
    .json<Response>();
};

export const bindSocialAccount = async (connectorId: string) => {
  return api
    .post('/api/session/bind-social', {
      json: {
        connectorId,
      },
    })
    .json();
};

export const bindSocialRelatedUser = async (connectorId: string) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post('/api/session/sign-in/bind-social-related-user', {
      json: {
        connectorId,
      },
    })
    .json<Response>();
};

export const registerWithSocial = async (connectorId: string) => {
  type Response = {
    redirectTo: string;
  };

  return api
    .post('/api/session/register/social', {
      json: {
        connectorId,
      },
    })
    .json<Response>();
};
