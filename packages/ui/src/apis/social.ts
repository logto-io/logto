import ky from 'ky';

export const invokeSocialSignIn = async (
  connectorId: string,
  state: string,
  redirectUri: string
) => {
  type Response = {
    redirectTo: string;
  };

  return ky
    .post('/api/session/sign-in/social', {
      json: {
        connectorId,
        state,
        redirectUri,
      },
    })
    .json<Response>();
};

export const signInWithSoical = async (parameters: {
  connectorId: string;
  state: string;
  redirectUri: string;
  code: string;
}) => {
  type Response = {
    redirectTo: string;
  };

  return ky
    .post('/api/session/sign-in/social', {
      json: parameters,
    })
    .json<Response>();
};

export const bindSocialAccount = async (connectorId: string) => {
  type Response = {
    redirectTo: string;
  };

  return ky
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

  return ky
    .post('/api/session/register/social', {
      json: {
        connectorId,
      },
    })
    .json<Response>();
};
