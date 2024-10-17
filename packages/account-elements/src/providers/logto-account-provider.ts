import { createContext, provide } from '@lit/context';
import type { UserProfileResponse } from '@logto/schemas';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { LogtoAccountApi, type AccessTokenFetcher } from '../api/index.js';

export type LogtoAccountContextType = {
  api: LogtoAccountApi;
  userProfile: UserProfileResponse;
};

export const logtoAccountContext = createContext<LogtoAccountContextType>('logto-account-context');

const tagName = 'logto-account-provider';

/**
 * LogtoAccountProvider
 *
 * Provides necessary account information to child components.
 */
@customElement(tagName)
export class LogtoAccountProvider extends LitElement {
  static tagName = tagName;

  /**
   * The endpoint URL of the Logto service.
   * This is a required property that specifies the base URL of the Logto service.
   * It serves as the base URL for internal API requests to the Logto service.
   *
   * Example: 'https://your-tenant-id.logto.app'
   */
  @property({ attribute: 'logto-endpoint' })
  logtoEndpoint!: string;

  /**
   * The access token fetcher function.
   * This property can be set in two ways:
   * 1. Directly as a prop in supported frameworks.
   * 2. Via the `init` method in vanilla JS scenarios.
   *
   * It is used to obtain the access token for Account-related API interactions.
   * This method is called every time the account elements make a request to the backend API.
   *
   * This method should handle access token expiration and request a new token when needed.
   *
   * Note: If you are using the `getAccessToken` method provided by the Logto SDK,
   * it already ensures that a valid access token is obtained.
   */
  @property({ attribute: false })
  private accessTokenFetcher?: AccessTokenFetcher;

  @provide({ context: logtoAccountContext })
  private accountContext?: LogtoAccountContextType;

  /**
   * Initializes the LogtoAccountProvider with an access token fetcher.
   * This method should be used in scenarios where direct prop passing is not supported.
   *
   * @param accessTokenFetcher A function to fetch the access token.
   */
  @property({ attribute: false })
  public init = (accessTokenFetcher: AccessTokenFetcher) => {
    this.accessTokenFetcher ||= accessTokenFetcher;

    void this.initProvider();
  };

  connectedCallback() {
    super.connectedCallback();
    if (!this.logtoEndpoint) {
      throw new Error('logto-endpoint is required');
    }
    /**
     * This path initializes the provider
     * when accessTokenFetcher is directly set on the element.
     */
    if (this.accessTokenFetcher) {
      void this.initProvider();
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  private async initProvider() {
    if (!this.logtoEndpoint || !this.accessTokenFetcher) {
      throw new Error('`logto-endpoint` and `accessTokenFetcher` are both required');
    }

    const api = new LogtoAccountApi(this.logtoEndpoint, this.accessTokenFetcher);
    this.accountContext = {
      api: new LogtoAccountApi(this.logtoEndpoint, this.accessTokenFetcher),
      userProfile: await api.fetchUserProfile(),
    };
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoAccountProvider;
  }
}
