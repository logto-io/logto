type Second = number;

export class ClientCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientCredentialsError';
  }
}

export type ClientCredentialsOptions = {
  clientId: string;
  clientSecret: string;
  tokenEndpoint: string;
  tokenParams?: Record<string, string>;
  /**
   * The time in seconds before the access token expires to consider it valid.
   * @default 60
   */
  accessTokenExpiryLeeway?: Second;
};

/**
 * A class handles client credentials for API authentication. It caches the access token
 * and provides methods to retrieve it, ensuring the token is valid and refreshing it when necessary.
 */
export class ClientCredentials {
  protected accessToken?: string;
  protected accessTokenExpiresAt?: Second;

  get AccessTokenExpiryLeeway(): Second {
    return this.options.accessTokenExpiryLeeway ?? 60;
  }

  constructor(protected options: ClientCredentialsOptions) { }

  /**
   * Retrieves the access token, refreshing it if necessary.
   * @returns The access token as a string.
   */
  async getAccessToken(): Promise<string> {
    const now = new Date();

    // If the access token is not set or has expired, refresh it
    if (
      !this.accessToken ||
      !this.accessTokenExpiresAt ||
      this.accessTokenExpiresAt <= Math.floor(now.getTime() / 1000) + this.AccessTokenExpiryLeeway
    ) {
      const response = await fetch(this.options.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.options.clientId,
          client_secret: this.options.clientSecret,
          ...this.options.tokenParams,
        }).toString(),
      });

      if (!response.ok) {
        throw new ClientCredentialsError(
          `Failed to fetch access token: ${response.status} ${response.statusText}`
        );
      }

      const data: unknown = await response.json();

      if (typeof data !== 'object' || data === null || !('access_token' in data)) {
        throw new ClientCredentialsError('Invalid response from token endpoint');
      }

      if (!('expires_in' in data) || typeof data.expires_in !== 'number') {
        throw new ClientCredentialsError('Invalid or missing expires_in in token response');
      }

      this.accessToken = String(data.access_token);
      this.accessTokenExpiresAt = Math.floor(now.getTime() / 1000) + data.expires_in;
    }

    return this.accessToken;
  }
}
