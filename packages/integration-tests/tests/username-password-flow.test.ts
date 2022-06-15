import {
  createRequester,
  fetchOidcConfig,
  fetchTokenByAuthorizationCode,
  generateSignInUri,
  verifyAndParseCodeFromCallbackUri,
} from '@logto/js';
import got from 'got/dist/source';

import api from '@/api';

import { adminConsoleApplicationId, discoveryUrl, logtoUrl, redirectUri } from '../src/constants';
import { createLogtoContext } from '../src/logto-context';
import { extractCookie, generatePassword, generateUsername } from '../src/utils';

describe('username and password flow', () => {
  const {
    account,
    getInteractionCookie,
    getState,
    getCodeVerifier,
    getCodeChallenge,
    getAuthorizationCode,
    getNextRedirectTo,
    getAuthorizationEndpoint,
    getTokenEndpoint,
    initInteraction,
    updateCookie,
    setAuthorizationCode,
    setNextRedirectTo,
    setUpEndpoints,
  } = createLogtoContext({
    username: generatePassword(),
    password: generateUsername(),
  });

  beforeAll(async () => {
    await initInteraction();
  });

  it('should fetch OIDC configuration', async () => {
    const oidcConfig = await fetchOidcConfig(discoveryUrl, createRequester());
    const { authorizationEndpoint, tokenEndpoint } = oidcConfig;
    expect(authorizationEndpoint).toBeTruthy();
    expect(tokenEndpoint).toBeTruthy();
    setUpEndpoints({ authorizationEndpoint, tokenEndpoint });
  });

  it('should visit authorization endpoint and get interaction cookie', async () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint: getAuthorizationEndpoint(),
      clientId: adminConsoleApplicationId,
      redirectUri,
      codeChallenge: getCodeChallenge(),
      state: getState(),
    });

    const response = await got(signInUri, {
      followRedirect: false,
    });

    // Note: this will redirect to the ui sign in page
    expect(response.statusCode).toBe(303);
    expect(response.body).toBe('Redirecting to <a href="/sign-in">/sign-in</a>.');

    const cookie = extractCookie(response);
    expect(cookie).toBeTruthy();
    updateCookie(cookie);
  });

  it('should register with username and password and redirect to oidc/auth endpoint to start an auth process', async () => {
    type RegisterResponse = {
      redirectTo: string;
    };

    const registerResponse = await api
      .post('session/register/username-password', {
        headers: {
          cookie: getInteractionCookie(),
        },
        json: account,
      })
      .json<RegisterResponse>();

    const { redirectTo } = registerResponse;

    expect(redirectTo).toBeTruthy();
    expect(redirectTo.startsWith(`${logtoUrl}/oidc/auth`)).toBeTruthy();
  });

  it('should sign in with username and password and redirect to oidc/auth endpoint to start an auth process', async () => {
    type SignInResponse = {
      redirectTo: string;
    };

    const signInResponse = await api
      .post('session/sign-in/username-password', {
        headers: {
          cookie: getInteractionCookie(),
        },
        json: account,
        followRedirect: false,
      })
      .json<SignInResponse>();

    const { redirectTo: invokeAuthUrl } = signInResponse;

    expect(invokeAuthUrl).toBeTruthy();
    expect(invokeAuthUrl.startsWith(`${logtoUrl}/oidc/auth`)).toBeTruthy();

    setNextRedirectTo(invokeAuthUrl);
  });

  it('should invoke the auth process and redirect to the consent page with session cookie', async () => {
    const invokeAuthUrl = getNextRedirectTo();
    const invokeAuthResponse = await got.get(invokeAuthUrl, {
      headers: {
        cookie: getInteractionCookie(),
      },
      followRedirect: false,
    });

    // Note: Redirect to consent page
    expect(invokeAuthResponse).toHaveProperty('statusCode', 303);
    expect(invokeAuthResponse.body).toBe(
      'Redirecting to <a href="/sign-in/consent">/sign-in/consent</a>.'
    );

    const cookie = extractCookie(invokeAuthResponse);
    expect(cookie).toBeTruthy();
    expect(cookie.includes('_session.sig')).toBeTruthy();

    updateCookie(cookie);
  });

  it('should redirect to oidc/auth endpoint to complete the auth process after consent', async () => {
    type ConsentResponse = {
      redirectTo: string;
    };

    const consentResponse = await api
      .post('session/consent', {
        headers: {
          cookie: getInteractionCookie(),
        },
        followRedirect: false,
      })
      .json<ConsentResponse>();

    const { redirectTo: completeAuthUrl } = consentResponse;

    expect(completeAuthUrl).toBeTruthy();
    expect(completeAuthUrl.startsWith(`${logtoUrl}/oidc/auth`)).toBeTruthy();

    setNextRedirectTo(completeAuthUrl);
  });

  it('should get the authorization code from the callback uri when the auth process is completed', async () => {
    const completeAuthUrl = getNextRedirectTo();
    const authCodeResponse = await got.get(completeAuthUrl, {
      headers: {
        cookie: getInteractionCookie(),
      },
    });

    expect(authCodeResponse).toHaveProperty('statusCode', 200);
    const callbackUri = authCodeResponse.redirectUrls[0];
    expect(callbackUri).toBeTruthy();

    if (!callbackUri) {
      throw new Error('No redirect uri');
    }

    const authorizationCode = verifyAndParseCodeFromCallbackUri(
      callbackUri,
      redirectUri,
      getState()
    );
    expect(authorizationCode).toBeTruthy();

    setAuthorizationCode(authorizationCode);
  });

  it('should fetch token by authorization code', async () => {
    const token = await fetchTokenByAuthorizationCode(
      {
        clientId: adminConsoleApplicationId,
        tokenEndpoint: getTokenEndpoint(),
        redirectUri,
        codeVerifier: getCodeVerifier(),
        code: getAuthorizationCode(),
      },
      createRequester()
    );

    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('expiresIn');
    expect(token).toHaveProperty('idToken');
    expect(token).toHaveProperty('refreshToken');
    expect(token).toHaveProperty('scope');
    expect(token).toHaveProperty('tokenType');
  });
});
