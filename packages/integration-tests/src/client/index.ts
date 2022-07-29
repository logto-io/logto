import LogtoClient, { LogtoConfig } from '@logto/node';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';
import got from 'got';

import { consent } from '@/api';
import { demoAppRedirectUri, logtoUrl } from '@/constants';
import { extractCookie } from '@/utils';

import { MemoryStorage } from './storage';

const defaultConfig = {
  endpoint: logtoUrl,
  appId: demoAppApplicationId,
  persistAccessToken: false,
};

export default class MockClient {
  public interactionCookie?: string;
  private navigateUrl?: string;

  private readonly storage: MemoryStorage;
  private readonly logto: LogtoClient;

  constructor(config?: Partial<LogtoConfig>) {
    this.storage = new MemoryStorage();

    this.logto = new LogtoClient(
      { ...defaultConfig, ...config },
      {
        navigate: (url: string) => {
          this.navigateUrl = url;
        },
        storage: this.storage,
      }
    );
  }

  public async initSession(callbackUri = demoAppRedirectUri) {
    await this.logto.signIn(callbackUri);

    assert(this.navigateUrl, new Error('Unable to navigate to sign in uri'));
    assert(
      this.navigateUrl.startsWith(`${logtoUrl}/oidc/auth`),
      new Error('Unable to navigate to sign in uri')
    );

    // Mock SDK sign-in navigation
    const response = await got(this.navigateUrl, {
      followRedirect: false,
    });

    // Note: should redirect to sign-in page
    assert(
      response.statusCode === 303 && response.headers.location === '/sign-in',
      new Error('Visit sign in uri failed')
    );

    // Get session cookie
    this.interactionCookie = extractCookie(response);
    assert(this.interactionCookie, new Error('Get cookie from authorization endpoint failed'));
  }

  public async processSession(redirectTo: string) {
    // Note: should redirect to OIDC auth endpoint
    assert(redirectTo.startsWith(`${logtoUrl}/oidc/auth`), new Error('SignIn or Register failed'));

    const authResponse = await got.get(redirectTo, {
      headers: {
        cookie: this.interactionCookie,
      },
      followRedirect: false,
    });

    // Note: Should redirect to logto consent page
    assert(
      authResponse.statusCode === 303 && authResponse.headers.location === '/sign-in/consent',
      new Error('Invoke auth before consent failed')
    );

    this.interactionCookie = extractCookie(authResponse);

    await this.consent();
  }

  public async getAccessToken(resource?: string) {
    return this.logto.getAccessToken(resource);
  }

  public async signOut(postSignOutRedirectUri?: string) {
    return this.logto.signOut(postSignOutRedirectUri);
  }

  public get isAuthenticated() {
    return this.logto.isAuthenticated;
  }

  private readonly consent = async () => {
    // Note: If sign in action completed successfully, we will get `_session.sig` in the cookie.
    assert(this.interactionCookie, new Error('Session not found'));
    assert(this.interactionCookie.includes('_session.sig'), new Error('Session not found'));

    const { redirectTo } = await consent(this.interactionCookie);

    // Note: should redirect to oidc auth endpoint
    assert(redirectTo.startsWith(`${logtoUrl}/oidc/auth`), new Error('Consent failed'));

    const authCodeResponse = await got.get(redirectTo, {
      headers: {
        cookie: this.interactionCookie,
      },
      followRedirect: false,
    });

    // Note: Should redirect to the signInCallbackUri
    assert(authCodeResponse.statusCode === 303, new Error('Complete auth failed'));
    const signInCallbackUri = authCodeResponse.headers.location;
    assert(signInCallbackUri, new Error('Get sign in callback uri failed'));

    await this.logto.handleSignInCallback(signInCallbackUri);
  };
}
