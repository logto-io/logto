import {
  fetchOidcConfig,
  createRequester,
  generateSignInUri,
  verifyAndParseCodeFromCallbackUri,
  fetchTokenByAuthorizationCode,
} from '@logto/js';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';
import got from 'got/dist/source';

import api from '../api';
import { demoAppRedirectUri, discoveryUrl, logtoUrl } from '../constants';
import { extractCookie } from '../utils';
import { UserSignInContext } from './context';

type RegisterResponse = {
  redirectTo: string;
};

type SignInResponse = {
  redirectTo: string;
};

type ConsentResponse = {
  redirectTo: string;
};

export const signIn = async (userSignInContext: UserSignInContext) => {
  await doFetchOidcConfig(userSignInContext);
  await doVisitAuthorizationEndpointAndGetCookie(userSignInContext);
  await doRegisterWithUsernamePassword(userSignInContext);
  await doSignInWithUsernamePassword(userSignInContext);
  await doConsentAndCompleteAuth(userSignInContext);
  await doHandleCallbackUriAndFetchToken(userSignInContext);
};

export const doFetchOidcConfig = async (userSignInContext: UserSignInContext) => {
  const oidcConfig = await fetchOidcConfig(discoveryUrl, createRequester());
  const { authorizationEndpoint, tokenEndpoint } = oidcConfig;

  userSignInContext.setData('authorizationEndpoint', authorizationEndpoint);
  userSignInContext.setData('tokenEndpoint', tokenEndpoint);
};

export const doVisitAuthorizationEndpointAndGetCookie = async (
  userSignInContext: UserSignInContext
) => {
  const signInUri = generateSignInUri({
    authorizationEndpoint: userSignInContext.getData('authorizationEndpoint'),
    clientId: demoAppApplicationId,
    redirectUri: demoAppRedirectUri,
    codeChallenge: userSignInContext.getData('codeChallenge'),
    state: userSignInContext.getData('state'),
  });

  const response = await got(signInUri, {
    followRedirect: false,
  });

  // Note: After visit the authorization endpoint successfully, it will redirect the user to the ui sign in page.
  assert(
    response.statusCode === 303 && response.headers.location === '/sign-in',
    new Error('Visit authorization endpoint failed')
  );

  const cookie = extractCookie(response);
  assert(cookie, new Error('Get cookie from authorization endpoint failed'));

  userSignInContext.setData('interactionCookie', extractCookie(response));
};

export const doRegisterWithUsernamePassword = async (userSignInContext: UserSignInContext) => {
  const { redirectTo } = await api
    .post('session/register/username-password', {
      headers: {
        cookie: userSignInContext.getData('interactionCookie'),
      },
      json: userSignInContext.getData('account'),
    })
    .json<RegisterResponse>();

  // Note: If register successfully, it will redirect the user to the auth endpoint.
  assert(
    redirectTo.startsWith(`${logtoUrl}/oidc/auth`),
    new Error('Register with username and password failed')
  );
};

export const doSignInWithUsernamePassword = async (userSignInContext: UserSignInContext) => {
  const { redirectTo } = await api
    .post('session/sign-in/username-password', {
      headers: {
        cookie: userSignInContext.getData('interactionCookie'),
      },
      json: userSignInContext.getData('account'),
      followRedirect: false,
    })
    .json<SignInResponse>();

  // Note: If sign in successfully, it will redirect the user to the auth endpoint
  assert(
    redirectTo.startsWith(`${logtoUrl}/oidc/auth`),
    new Error('Sign in with username and password failed')
  );

  userSignInContext.setData('invokeAuthBeforeConsentUri', redirectTo);
};

export const doConsentAndCompleteAuth = async (userSignInContext: UserSignInContext) => {
  const invokeAuthBeforeConsentUri = userSignInContext.getData('invokeAuthBeforeConsentUri');

  const invokeAuthBeforeConsentResponse = await got.get(invokeAuthBeforeConsentUri, {
    headers: {
      cookie: userSignInContext.getData('interactionCookie'),
    },
    followRedirect: false,
  });

  // Note: If visit invokeAuthBeforeConsentUri successfully, it will redirect the user to the consent page.
  assert(
    invokeAuthBeforeConsentResponse.statusCode === 303 &&
      invokeAuthBeforeConsentResponse.headers.location === '/sign-in/consent',
    new Error('Invoke auth before consent failed')
  );

  const cookie = extractCookie(invokeAuthBeforeConsentResponse);

  // Note: If visit invokeAuthBeforeConsentUri successfully, we will get `session` in the cookie.
  assert(
    Boolean(cookie) && cookie.includes('_session.sig'),
    new Error('Invoke auth before consent failed')
  );

  userSignInContext.setData('interactionCookie', cookie);

  // Consent
  const { redirectTo } = await api
    .post('session/consent', {
      headers: {
        cookie: userSignInContext.getData('interactionCookie'),
      },
      followRedirect: false,
    })
    .json<ConsentResponse>();

  // Note: If consent successfully, it will redirect the user to the auth endpoint.
  assert(redirectTo.startsWith(`${logtoUrl}/oidc/auth`), new Error('Consent failed'));

  // Complete auth
  const authCodeResponse = await got.get(redirectTo, {
    headers: {
      cookie: userSignInContext.getData('interactionCookie'),
    },
  });

  assert(authCodeResponse.statusCode === 200, new Error('Complete auth failed'));
  const signInCallbackUri = authCodeResponse.redirectUrls[0];

  assert(signInCallbackUri, new Error('Get sign in callback uri failed'));

  userSignInContext.setData('signInCallbackUri', signInCallbackUri);
};

export const doHandleCallbackUriAndFetchToken = async (userSignInContext: UserSignInContext) => {
  const callbackUri = userSignInContext.getData('signInCallbackUri');

  const authorizationCode = verifyAndParseCodeFromCallbackUri(
    callbackUri,
    demoAppRedirectUri,
    userSignInContext.getData('state')
  );

  await fetchTokenByAuthorizationCode(
    {
      clientId: demoAppApplicationId,
      tokenEndpoint: userSignInContext.getData('tokenEndpoint'),
      redirectUri: demoAppRedirectUri,
      codeVerifier: userSignInContext.getData('codeVerifier'),
      code: authorizationCode,
    },
    createRequester()
  );
};
