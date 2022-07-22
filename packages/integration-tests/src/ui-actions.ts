import { assert } from '@silverhand/essentials';
import got from 'got/dist/source';

import api from './api';
import { logtoUrl } from './constants';
import { extractCookie } from './utils';

type RegisterResponse = {
  redirectTo: string;
};

type SignInResponse = {
  redirectTo: string;
};

type ConsentResponse = {
  redirectTo: string;
};

export const visitSignInUri = async (signInUri: string) => {
  const response = await got(signInUri, {
    followRedirect: false,
  });

  // Note: After visit the sign in uri successfully, it will redirect the user to the ui sign in page.
  assert(
    response.statusCode === 303 && response.headers.location === '/sign-in',
    new Error('Visit sign in uri failed')
  );

  const cookie = extractCookie(response);
  assert(cookie, new Error('Get cookie from authorization endpoint failed'));

  return cookie;
};

export const registerUserWithUsernameAndPassword = async (
  username: string,
  password: string,
  interactionCookie: string
) => {
  const { redirectTo } = await api
    .post('session/register/username-password', {
      headers: {
        cookie: interactionCookie,
      },
      json: {
        username,
        password,
      },
    })
    .json<RegisterResponse>();

  // Note: If register successfully, it will redirect the user to the auth endpoint.
  assert(
    redirectTo.startsWith(`${logtoUrl}/oidc/auth`),
    new Error('Register with username and password failed')
  );
};

export const signInWithUsernameAndPassword = async (
  username: string,
  password: string,
  interactionCookie: string
) => {
  const { redirectTo: completeSignInActionUri } = await api
    .post('session/sign-in/username-password', {
      headers: {
        cookie: interactionCookie,
      },
      json: {
        username,
        password,
      },
      followRedirect: false,
    })
    .json<SignInResponse>();

  // Note: If sign in successfully, it will redirect the user to the auth endpoint
  assert(
    completeSignInActionUri.startsWith(`${logtoUrl}/oidc/auth`),
    new Error('Sign in with username and password failed')
  );

  // Note: visit the completeSignInActionUri to get a new interaction cookie with session.
  const completeSignInActionResponse = await got.get(completeSignInActionUri, {
    headers: {
      cookie: interactionCookie,
    },
    followRedirect: false,
  });

  // Note: If sign in action completed successfully, it will redirect the user to the consent page.
  assert(
    completeSignInActionResponse.statusCode === 303 &&
      completeSignInActionResponse.headers.location === '/sign-in/consent',
    new Error('Invoke auth before consent failed')
  );

  const cookieWithSession = extractCookie(completeSignInActionResponse);

  // Note: If sign in action completed successfully, we will get `_session.sig` in the cookie.
  assert(
    Boolean(cookieWithSession) && cookieWithSession.includes('_session.sig'),
    new Error('Invoke auth before consent failed')
  );

  return cookieWithSession;
};

export const consentUserAndGetSignInCallbackUri = async (interactionCookie: string) => {
  const { redirectTo: completeAuthUri } = await api
    .post('session/consent', {
      headers: {
        cookie: interactionCookie,
      },
      followRedirect: false,
    })
    .json<ConsentResponse>();

  // Note: If consent successfully, it will redirect the user to the auth endpoint.
  assert(completeAuthUri.startsWith(`${logtoUrl}/oidc/auth`), new Error('Consent failed'));

  // Note: complete the auth process to get the sign in callback uri.
  const authCodeResponse = await got.get(completeAuthUri, {
    headers: {
      cookie: interactionCookie,
    },
    followRedirect: false,
  });

  // Note: If complete auth successfully, it will redirect the user to the redirect uri.
  assert(authCodeResponse.statusCode === 303, new Error('Complete auth failed'));

  const signInCallbackUri = authCodeResponse.headers.location;
  assert(signInCallbackUri, new Error('Get sign in callback uri failed'));

  return signInCallbackUri;
};
