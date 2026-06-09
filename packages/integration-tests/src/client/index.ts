import LogtoClient, { PersistKey, type LogtoConfig, type SignInOptions } from '@logto/node';
import { demoAppApplicationId } from '@logto/schemas';
import type { Nullable, Optional } from '@silverhand/essentials';
import { assert } from '@silverhand/essentials';
import ky, { type KyInstance } from 'ky';

import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';

import { getSignInCallbackContext, getSubmittingCallbackUri } from './callback-uri.js';
import { MemoryStorage } from './storage.js';

export const defaultConfig = {
  endpoint: logtoUrl,
  appId: demoAppApplicationId,
  persistAccessToken: false,
};

const getCookieMergeKey = (cookie: string) => {
  const [nameValue, ...attributes] = cookie.split(';').map((value) => value.trim());
  const name = nameValue?.split('=')[0];

  if (!name) {
    return;
  }

  const scope = new Map<string, string | undefined>();

  for (const attribute of attributes) {
    const [key, value] = attribute.split('=');

    if (key) {
      scope.set(key.toLowerCase(), value);
    }
  }

  return [name, scope.get('domain') ?? '', scope.get('path') ?? ''].join('|');
};

const getCookieHeaderValue = (cookie: string) => cookie.split(';')[0]?.trim();

const getCookiePath = (cookie: string) => {
  const [, ...attributes] = cookie.split(';').map((value) => value.trim());

  for (const attribute of attributes) {
    const [key, value] = attribute.split('=');

    if (key?.toLowerCase() === 'path') {
      return value ?? '/';
    }
  }

  return '/';
};

const isCookiePathMatched = (cookiePath: string, requestPath: string) =>
  cookiePath === '/' ||
  requestPath === cookiePath ||
  requestPath.startsWith(cookiePath.endsWith('/') ? cookiePath : `${cookiePath}/`);

export default class MockClient {
  public rawCookies: string[] = [];
  protected readonly config: LogtoConfig;
  protected readonly storage: MemoryStorage;
  protected readonly logto: LogtoClient;
  protected readonly api: KyInstance;

  private navigateUrl?: string;

  constructor(config?: Partial<LogtoConfig>, api?: KyInstance) {
    this.storage = new MemoryStorage();
    this.config = { ...defaultConfig, ...config };
    this.api = api ?? ky.extend({ prefixUrl: this.config.endpoint + '/api' });

    this.logto = new LogtoClient(this.config, {
      navigate: (url: string) => {
        this.navigateUrl = url;
      },
      storage: this.storage,
    });
  }

  // TODO: Rename to sessionCookies or something accurate
  public get interactionCookie(): string {
    return this.getCookieHeader();
  }

  public getCookieHeader(pathname?: string): string {
    const cookies = pathname
      ? this.rawCookies.filter((cookie) => isCookiePathMatched(getCookiePath(cookie), pathname))
      : this.rawCookies;

    return cookies
      .toSorted((cookieA, cookieB) => getCookiePath(cookieB).length - getCookiePath(cookieA).length)
      .map((cookie) => getCookieHeaderValue(cookie))
      .filter(Boolean)
      .join('; ');
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
    // Mock SDK sign-in navigation
    const response = await this.startAuthorization(redirectUri, options);

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

  public async startAuthorization(
    redirectUri = demoAppRedirectUri,
    options: Omit<SignInOptions, 'redirectUri'> = {},
    cookie?: string
  ) {
    await this.logto.signIn({ redirectUri, ...options });

    assert(this.navigateUrl, new Error('Unable to navigate to sign in uri'));
    assert(
      this.navigateUrl.startsWith(`${this.config.endpoint}/oidc/auth`),
      new Error('Unable to navigate to sign in uri')
    );

    return ky(this.navigateUrl, {
      headers: cookie ? { cookie } : undefined,
      redirect: 'manual',
      throwHttpErrors: false,
    });
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
        cookie: this.getCookieHeader(new URL(redirectTo).pathname),
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });
    const authResponseLocation = authResponse.headers.get('location');

    if (authResponse.status === 200) {
      const signInSession: unknown = JSON.parse(
        (await this.storage.getItem(PersistKey.SignInSession)) ?? 'null'
      );
      const { redirectUri, state } = getSignInCallbackContext(signInSession);
      const signInCallbackUri = getSubmittingCallbackUri(
        await authResponse.text(),
        redirectUri,
        state
      );

      this.mergeRawCookies(authResponse.headers.getSetCookie());
      await this.logto.handleSignInCallback(signInCallbackUri);

      return;
    }

    // Note: Should redirect to logto consent page
    if (
      authResponse.status !== 303 ||
      authResponseLocation !== `/consent?app_id=${this.config.appId}`
    ) {
      const body = await authResponse.text();

      throw new Error(
        `Invoke auth before consent failed: ${authResponse.status} ${
          authResponseLocation ?? ''
        } ${body.slice(0, 200)}`
      );
    }

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
        cookie: this.getCookieHeader(new URL(redirectTo).pathname),
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

  public async getAccessTokenClaims(resource?: string) {
    return this.logto.getAccessTokenClaims(resource);
  }

  public async getOrganizationTokenClaims(organizationId: string) {
    return this.logto.getOrganizationTokenClaims(organizationId);
  }

  public async clearAccessToken() {
    return this.logto.clearAccessToken();
  }

  public async getRefreshToken(): Promise<Nullable<string>> {
    return this.logto.getRefreshToken();
  }

  public async signOut(postSignOutRedirectUri?: string) {
    this.navigateUrl = undefined;
    await this.logto.signOut(postSignOutRedirectUri);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.navigateUrl) {
      throw new Error('No navigate URL found for sign-out');
    }
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

  public assignRawCookies(cookies: string[]) {
    this.rawCookies = cookies;
  }

  public mergeRawCookies(cookies: string[]) {
    const cookieMap = new Map<string, string>();

    for (const cookie of this.rawCookies) {
      const key = getCookieMergeKey(cookie);

      if (key) {
        cookieMap.set(key, cookie);
      }
    }

    for (const cookie of cookies) {
      const key = getCookieMergeKey(cookie);

      if (key) {
        cookieMap.set(key, cookie);
      }
    }

    this.rawCookies = [...cookieMap.values()];
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
    return this.api
      .post('experience/submit', { headers: { cookie: this.interactionCookie } })
      .json<{ redirectTo: string }>();
  }

  private readonly consent = async () => {
    // Note: If sign in action completed successfully, we will get `_session.sig` in the cookie.
    assert(this.interactionCookie, new Error('Session not found'));
    assert(this.interactionCookie.includes('_session.sig'), new Error('Session not found'));

    const consentResponse = await ky.get(`${this.config.endpoint}/consent`, {
      headers: {
        cookie: this.getCookieHeader('/consent'),
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
        cookie: this.getCookieHeader(new URL(redirectTo).pathname),
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });

    // Note: Should redirect to the signInCallbackUri
    assert(authCodeResponse.status === 303, new Error('Complete auth failed'));
    const signInCallbackUri = authCodeResponse.headers.get('location');
    assert(signInCallbackUri, new Error('Get sign in callback uri failed'));
    this.mergeRawCookies(authCodeResponse.headers.getSetCookie());

    return signInCallbackUri;
  };
}
