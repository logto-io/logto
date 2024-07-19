import type { LogtoConfig, SignInOptions } from '@logto/node';
import LogtoClient from '@logto/node';
import { assert } from '@silverhand/essentials';
import ky from 'ky';

import { appId, logtoExperienceUrl, redirectUri, tenantId } from '../consts.js';
import { exitOnFatalError } from '../utils.js';

import { MemoryStorage } from './storage.js';

export const defaultConfig = {
  endpoint: logtoExperienceUrl,
  appId,
  persistAccessToken: false,
};

export default class Client {
  public rawCookies: string[] = [];
  protected readonly config: LogtoConfig;
  protected readonly storage: MemoryStorage;
  protected readonly logto: LogtoClient;

  private navigateUrl?: string;
  private signInCallbackUrl?: string;

  constructor(config?: Partial<LogtoConfig>) {
    this.storage = new MemoryStorage();
    this.config = { ...defaultConfig, ...config };

    this.logto = new LogtoClient(this.config, {
      navigate: (url: string) => {
        this.navigateUrl = url;
      },
      storage: this.storage,
    });
  }

  public get sessionCookie(): string {
    return this.rawCookies.join('; ');
  }

  public async initSession(options: Omit<SignInOptions, 'redirectUri'> = {}) {
    try {
      assert(tenantId, new Error('LOGTO_TENANT_ID is not set.'));
      await this.logto.signIn({ redirectUri, ...options });

      assert(this.navigateUrl, new Error('Unable to navigate to sign-in uri'));
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
        response.status === 303 && response.headers.get('location')?.startsWith('/sign-in'),
        new Error('Visit sign-in uri failed')
      );

      // Get session cookies
      this.rawCookies = response.headers.getSetCookie();
      assert(this.sessionCookie, new Error('Get cookies from authorization endpoint failed'));
    } catch (error) {
      exitOnFatalError(error);
    }
  }

  public async handleSignInCallback() {
    try {
      assert(this.signInCallbackUrl, new Error('No sign-in callback url'));
      await this.logto.handleSignInCallback(this.signInCallbackUrl);
    } catch (error) {
      exitOnFatalError(error);
    }
  }

  public async getIdToken() {
    return this.logto.getIdToken();
  }

  public async getIdTokenClaims() {
    return this.logto.getIdTokenClaims();
  }

  public setSignInCallbackUrl(url: string) {
    this.signInCallbackUrl = url;
  }
}
