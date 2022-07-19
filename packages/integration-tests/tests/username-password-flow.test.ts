import {
  createRequester,
  fetchOidcConfig,
  fetchTokenByAuthorizationCode,
  generateSignInUri,
  verifyAndParseCodeFromCallbackUri,
} from '@logto/js';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import got from 'got/dist/source';

import api from '@/api';

import { discoveryUrl, logtoUrl, redirectUri } from '../src/constants';
import { LogtoContext } from '../src/logto-context';
import { extractCookie } from '../src/utils';

describe('username and password flow', () => {
  const logtoContext = new LogtoContext();

  beforeAll(async () => {
    await logtoContext.init();
  });

  it('should fetch OIDC configuration', async () => {
    const oidcConfig = await fetchOidcConfig(discoveryUrl, createRequester());
    const { authorizationEndpoint, tokenEndpoint } = oidcConfig;
    expect(authorizationEndpoint).toBeTruthy();
    expect(tokenEndpoint).toBeTruthy();

    logtoContext.setData('authorizationEndpoint', authorizationEndpoint);
    logtoContext.setData('tokenEndpoint', tokenEndpoint);
  });

  it('should visit authorization endpoint and get interaction cookie', async () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint: logtoContext.authorizationEndpoint,
      clientId: adminConsoleApplicationId,
      redirectUri,
      codeChallenge: logtoContext.codeChallenge,
      state: logtoContext.state,
    });

    const response = await got(signInUri, {
      followRedirect: false,
    });

    // Note: this will redirect to the ui sign in page
    expect(response.statusCode).toBe(303);
    expect(response.headers.location).toBe('/sign-in');

    const cookie = extractCookie(response);
    expect(cookie).toBeTruthy();

    logtoContext.setData('interactionCookie', cookie);
  });

  it('should register with username and password and redirect to oidc/auth endpoint to start an auth process', async () => {
    type RegisterResponse = {
      redirectTo: string;
    };

    const registerResponse = await api
      .post('session/register/username-password', {
        headers: {
          cookie: logtoContext.interactionCookie,
        },
        json: logtoContext.account,
      })
      .json<RegisterResponse>();

    const { redirectTo: invokeAuthUrl } = registerResponse;

    expect(invokeAuthUrl.startsWith(`${logtoUrl}/oidc/auth`)).toBeTruthy();
  });

  it('should sign in with username and password and redirect to oidc/auth endpoint to start an auth process', async () => {
    type SignInResponse = {
      redirectTo: string;
    };

    const signInResponse = await api
      .post('session/sign-in/username-password', {
        headers: {
          cookie: logtoContext.interactionCookie,
        },
        json: logtoContext.account,
        followRedirect: false,
      })
      .json<SignInResponse>();

    const { redirectTo: invokeAuthUrl } = signInResponse;

    expect(invokeAuthUrl.startsWith(`${logtoUrl}/oidc/auth`)).toBeTruthy();

    logtoContext.setData('nextRedirectTo', invokeAuthUrl);
  });

  it('should invoke the auth process and redirect to the consent page with session cookie', async () => {
    const invokeAuthUrl = logtoContext.nextRedirectTo;
    const invokeAuthResponse = await got.get(invokeAuthUrl, {
      headers: {
        cookie: logtoContext.interactionCookie,
      },
      followRedirect: false,
    });

    // Note: Redirect to consent page
    expect(invokeAuthResponse).toHaveProperty('statusCode', 303);
    expect(invokeAuthResponse.headers.location).toBe('/sign-in/consent');

    const cookie = extractCookie(invokeAuthResponse);
    expect(cookie).toBeTruthy();
    expect(cookie.includes('_session.sig')).toBeTruthy();

    logtoContext.setData('interactionCookie', cookie);
  });

  it('should redirect to oidc/auth endpoint to complete the auth process after consent', async () => {
    type ConsentResponse = {
      redirectTo: string;
    };

    const consentResponse = await api
      .post('session/consent', {
        headers: {
          cookie: logtoContext.interactionCookie,
        },
        followRedirect: false,
      })
      .json<ConsentResponse>();

    const { redirectTo: completeAuthUrl } = consentResponse;

    expect(completeAuthUrl.startsWith(`${logtoUrl}/oidc/auth`)).toBeTruthy();

    logtoContext.setData('nextRedirectTo', completeAuthUrl);
  });

  it('should get the authorization code from the callback uri when the auth process is completed', async () => {
    const completeAuthUrl = logtoContext.nextRedirectTo;
    const authCodeResponse = await got.get(completeAuthUrl, {
      headers: {
        cookie: logtoContext.interactionCookie,
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
      logtoContext.state
    );
    expect(authorizationCode).toBeTruthy();

    logtoContext.setData('authorizationCode', authorizationCode);
  });

  it('should fetch token by authorization code', async () => {
    const token = await fetchTokenByAuthorizationCode(
      {
        clientId: adminConsoleApplicationId,
        tokenEndpoint: logtoContext.tokenEndpoint,
        redirectUri,
        codeVerifier: logtoContext.codeVerifier,
        code: logtoContext.authorizationCode,
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
