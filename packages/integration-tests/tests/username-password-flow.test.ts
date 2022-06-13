import {
  createRequester,
  fetchTokenByAuthorizationCode,
  verifyAndParseCodeFromCallbackUri,
} from '@logto/js';
import got from 'got/dist/source';

import api from '@/api';

import { adminConsoleAppId, redirectUri, tokenEndpoint } from '../src/constants';
import { createLogtoContext } from '../src/logto-context';
import { extractCookie, generatePassword, generateUsername } from '../src/utils';

describe('username and password flow', () => {
  const {
    account,
    getInteractionCookie,
    getState,
    getCodeVerifier,
    startInteraction,
    resetInteraction,
    updateCookie,
  } = createLogtoContext({
    username: generatePassword(),
    password: generateUsername(),
  });

  beforeEach(async () => {
    await startInteraction();
  });

  afterEach(() => {
    resetInteraction();
  });

  it('should register with username and password', async () => {
    const registerRequest = await api.post('session/register/username-password', {
      headers: {
        cookie: getInteractionCookie(),
      },
      json: account,
    });

    expect(registerRequest).toHaveProperty('statusCode', 200);
  });

  it('should sign in with username and password', async () => {
    // Mark: Sign In with username and password
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

    expect(signInResponse).toHaveProperty('redirectTo');

    // Mark: Auth process
    const authResponse = await got.get(signInResponse.redirectTo, {
      headers: {
        cookie: getInteractionCookie(),
      },
      followRedirect: false,
    });

    // Note: Redirect to consent page
    expect(authResponse).toHaveProperty('statusCode', 303);

    // Note: Update cookie with authed session before consent
    updateCookie(extractCookie(authResponse));

    // Mark: Consent process
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

    expect(consentResponse).toHaveProperty('redirectTo');

    const authCodeResponse = await got.get(consentResponse.redirectTo, {
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

    // Mark: Get Access Token with auth code
    const code = verifyAndParseCodeFromCallbackUri(callbackUri, redirectUri, getState());

    const token = await fetchTokenByAuthorizationCode(
      {
        clientId: adminConsoleAppId,
        tokenEndpoint,
        redirectUri,
        codeVerifier: getCodeVerifier(),
        code,
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
