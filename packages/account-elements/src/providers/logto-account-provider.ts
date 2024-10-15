import { createContext, provide } from '@lit/context';
import type { UserProfileResponse } from '@logto/schemas';
import { html, LitElement, type PropertyValues } from 'lit';
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
   * This is a required property that specifies the function to fetch the access token.
   * It is used to obtain the access token for Account-related API interactions.
   * This method is called every time the account elements make a request to the backend API.
   *
   * This method should handle access token expiration. When the access token expires,
   * it should request a new access token.
   *
   * Note: If you are using the getAccessToken method provided by the Logto SDK,
   * the SDK already ensures that a valid access token is obtained.
   *
   * Important: When using this component in HTML, it's not possible to set non-string values directly.
   * In such cases, this `LogtoAccountProvider` will not be able to provide the account context to its child components
   * until this property is set via JavaScript after the component is mounted.
   */
  @property({ attribute: false })
  accessTokenFetcher?: AccessTokenFetcher;

  @provide({ context: logtoAccountContext })
  private accountContext?: LogtoAccountContextType;

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.logtoEndpoint) {
      throw new Error('logto-endpoint is required');
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    void this.handlePropertiesChange(changedProperties);
  }

  private async handlePropertiesChange(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('accessTokenFetcher') && this.accessTokenFetcher) {
      const api = new LogtoAccountApi(this.logtoEndpoint, this.accessTokenFetcher);
      const userProfile = await api.fetchUserProfile();
      this.accountContext = { api, userProfile };
    }
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoAccountProvider;
  }
}
