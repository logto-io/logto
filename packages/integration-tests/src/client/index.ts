import type { LogtoConfig, SignInOptions } from '@logto/node';
import LogtoClient from '@logto/node';
import { demoAppApplicationId } from '@logto/schemas';
import type { Nullable, Optional } from '@silverhand/essentials';
import { assert } from '@silverhand/essentials';
import ky, { type KyInstance } from 'ky';

import { submitInteraction } from '#src/api/index.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';

import { MemoryStorage } from './storage.js';

export const defaultConfig = {
  endpoint: logtoUrl,
  appId: demoAppApplicationId,
  persistAccessToken: false,
};
export default class MockClient {
  public rawCookies: string[] = [];
  protected readonly config: LogtoConfig;
  protected readonly storage: MemoryStorage;
  protected readonly logto: LogtoClient;

  private navigateUrl?: string;
  private readonly api: KyInstance;

  constructor(config?: Partial<LogtoConfig>) {
    this.storage = new MemoryStorage();
    this.config = { ...defaultConfig, ...config };
    this.api = ky.extend({ prefixUrl: this.config.endpoint + '/api' });

    this.logto = new LogtoClient(this.config, {
      navigate: (url: string) => {
        this.navigateUrl = url;
      },
      storage: this.storage,
    });
  }

  // TODO: Rename to sessionCookies or something accurate
  public get interactionCookie(): string {
    return this.rawCookies.join('; ');
  }

  public get parsedCookies(): Map<string, Optional<string>> {
    const map = new Map<string, Optional<string>>();

    for (const cookie of this.rawCookies) {
      for (const element of cookie.split(';')) {
        const [key, value] = element.trim().split('=');

        if (key) {
          map.set(key, value);
        }
      }
    }

    return map;
  }

  public async initSession(
    redirectUri = demoAppRedirectUri,
    options: Omit<SignInOptions, 'redirectUri'> = {}
  ) {
    await this.logto.signIn({ redirectUri, ...options });

    assert(this.navigateUrl, new Error('Unable to navigate to sign in uri'));
    assert(
      this.navigateUrl.startsWith(`${this.config.endpoint}/oidc/auth`),
      new Error('Unable to navigate to sign in uri')
    );

    // Mock SDK sign-in navigation
    const response = await ky(this.navigateUrl, {
      redirect: 'manual',
      throwHttpErrors: false,
    });

    // Note: should redirect to sign-in page
    assert(
      response.status === 303 &&
        response.headers
          .get('location')
          ?.startsWith(options.directSignIn ? '/direct/' : '/sign-in'),
      new Error('Visit sign in uri failed')
    );

    // Get session cookie
    this.rawCookies = response.headers.getSetCookie();
    assert(this.interactionCookie, new Error('Get cookie from authorization endpoint failed'));
  }

  /**
   *
   * @param {string} redirectTo the sign-in or register redirect uri
   * @param {boolean} [consent=true] whether to automatically consent. Need to manually handle the consent flow if set to false
   */
  public async processSession(redirectTo: string, consent = true) {
    // Note: should redirect to OIDC auth endpoint
    assert(
      redirectTo.startsWith(`${this.config.endpoint}/oidc/auth`),
      new Error('SignIn or Register failed')
    );

    const authResponse = await ky.get(redirectTo, {
      headers: {
        cookie: this.interactionCookie,
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });

    // Note: Should redirect to logto consent page
    assert(
      authResponse.status === 303 && authResponse.headers.get('location') === '/consent',
      new Error('Invoke auth before consent failed')
    );

    this.rawCookies = authResponse.headers.getSetCookie();

    // Manually handle the consent flow
    if (!consent) {
      return;
    }

    const signInCallbackUri = await this.consent();
    await this.logto.handleSignInCallback(signInCallbackUri);
  }

  public async manualConsent(redirectTo: string) {
    const authCodeResponse = await ky.get(redirectTo, {
      headers: {
        cookie: this.interactionCookie,
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });

    // Note: Should redirect to the signInCallbackUri
    assert(authCodeResponse.status === 303, new Error('Complete auth failed'));
    const signInCallbackUri = authCodeResponse.headers.get('location');
    assert(signInCallbackUri, new Error('Get sign in callback uri failed'));

    return this.logto.handleSignInCallback(signInCallbackUri);
  }

  public async getAccessToken(resource?: string, organizationId?: string) {
    return this.logto.getAccessToken(resource, organizationId);
  }

  public async getRefreshToken(): Promise<Nullable<string>> {
    return this.logto.getRefreshToken();
  }

  public async signOut(postSignOutRedirectUri?: string) {
    if (!this.navigateUrl) {
      throw new Error('No navigate URL found for sign-out');
    }

    await this.logto.signOut(postSignOutRedirectUri);
    await ky(this.navigateUrl);
  }

  public async isAuthenticated() {
    return this.logto.isAuthenticated();
  }

  public async getIdTokenClaims() {
    return this.logto.getIdTokenClaims();
  }

  public assignCookie(cookie: string) {
    this.rawCookies = cookie.split(';').map((value) => value.trim());
  }

  public async send<Args extends unknown[], T>(
    api: (cookie: string, ...args: Args) => Promise<T>,
    ...payload: Args
  ) {
    return api(this.interactionCookie, ...payload);
  }

  public async successSend<Args extends unknown[], T>(
    api: (cookie: string, ...args: Args) => Promise<T>,
    ...payload: Args
  ) {
    return expect(api(this.interactionCookie, ...payload)).resolves.not.toThrow();
  }

  public async submitInteraction() {
    return submitInteraction(this.api, this.interactionCookie);
  }

  private readonly consent = async () => {
    // Note: If sign in action completed successfully, we will get `_session.sig` in the cookie.
    assert(this.interactionCookie, new Error('Session not found'));
    assert(this.interactionCookie.includes('_session.sig'), new Error('Session not found'));

    const consentResponse = await ky.get(`${this.config.endpoint}/consent`, {
      headers: {
        cookie: this.interactionCookie,
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });

    // Consent page should auto consent and redirect to auth endpoint
    const redirectTo = consentResponse.headers.get('location');

    if (!redirectTo?.startsWith(`${this.config.endpoint}/oidc/auth`)) {
      throw new Error('Consent failed');
    }

    const authCodeResponse = await ky.get(redirectTo, {
      headers: {
        cookie: this.interactionCookie,
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });

    // Note: Should redirect to the signInCallbackUri
    assert(authCodeResponse.status === 303, new Error('Complete auth failed'));
    const signInCallbackUri = authCodeResponse.headers.get('location');
    assert(signInCallbackUri, new Error('Get sign in callback uri failed'));

    return signInCallbackUri;
  };
}
