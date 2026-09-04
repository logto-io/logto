import { createTimeoutSignal, getAbortReason, normalizeTimeout } from './timeout.js';

/** Indicates the number of seconds. */
type Seconds = number;

export type AccessToken = {
  value: string;
  expiresAt: Seconds;
  scope?: string;
};

export class ClientCredentialsError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
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
   * A value greater than or equal to the token lifetime causes every call to fetch a new token,
   * so cached-token invalidation protection cannot persist across calls.
   * @default 60
   */
  accessTokenExpiryLeeway?: Seconds;
  /**
   * The maximum time in seconds allowed for fetching an access token.
   * Non-positive and infinite values disable the timeout. `NaN` uses the default value.
   * @default 10
   */
  tokenRequestTimeout?: Seconds;
  /**
   * Returns an optional signal for each token request. The factory is called once per actual token
   * fetch, so concurrent callers sharing a fetch also share its signal. The signal is composed with
   * `tokenRequestTimeout`, and the first signal to abort cancels the request.
   */
  getTokenRequestSignal?: () => AbortSignal | undefined;
};

const createAbortPromise = (signal: AbortSignal) => {
  // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- `Promise.withResolvers` is standard since ES2024; the rule's built-in method list predates it.
  const { promise, reject } = Promise.withResolvers<never>();
  const handleAbort = () => {
    reject(getAbortReason(signal, 'Token request aborted'));
  };

  if (signal.aborted) {
    handleAbort();
  } else {
    signal.addEventListener('abort', handleAbort, { once: true });
  }

  return {
    promise,
    clear: () => {
      signal.removeEventListener('abort', handleAbort);
    },
  };
};

/**
 * A class handles client credentials for API authentication. It caches the access token
 * and provides methods to retrieve it, ensuring the token is valid and refreshing it when necessary.
 */
export class ClientCredentials {
  protected accessToken?: AccessToken;

  private accessTokenPromise?: Promise<AccessToken>;

  private awaitingValidationAfterRefresh = false;

  get accessTokenExpiryLeeway(): Seconds {
    return this.options.accessTokenExpiryLeeway ?? 60;
  }

  get tokenRequestTimeout(): Seconds {
    return normalizeTimeout(this.options.tokenRequestTimeout);
  }

  constructor(protected options: ClientCredentialsOptions) {}

  /**
   * Retrieves the access token, refreshing it if necessary.
   * Concurrent calls share the same token request.
   * @returns The access token and its metadata.
   */
  async getAccessToken(): Promise<AccessToken> {
    const now = new Date();

    // Return the cached token if it is still valid.
    if (
      this.accessToken?.expiresAt &&
      this.accessToken.expiresAt > Math.floor(now.getTime() / 1000) + this.accessTokenExpiryLeeway
    ) {
      return this.accessToken;
    }

    if (this.accessToken) {
      // A natural expiry starts a new invalidation cycle.
      this.awaitingValidationAfterRefresh = false;
    }

    if (this.accessTokenPromise) {
      return this.accessTokenPromise;
    }

    try {
      this.accessTokenPromise = this.fetchAccessToken();
      this.accessToken = await this.accessTokenPromise;
      return this.accessToken;
    } finally {
      this.accessTokenPromise = undefined;
    }
  }

  /**
   * Invalidates the cached token if it matches the token rejected by the API.
   * A delayed response for an older token must not invalidate a newer cached token.
   */
  invalidateAccessToken(token: string): void {
    if (this.accessToken?.value === token && !this.awaitingValidationAfterRefresh) {
      this.accessToken = undefined;
      this.awaitingValidationAfterRefresh = true;
    }
  }

  /** Allows a future 401 to invalidate the token after it receives a successful API response. */
  markAccessTokenAsValid(token: string): void {
    if (this.accessToken?.value === token) {
      this.awaitingValidationAfterRefresh = false;
    }
  }

  private async fetchAccessToken(): Promise<AccessToken> {
    const timeout = createTimeoutSignal(this.tokenRequestTimeout, 'Token request timed out');

    try {
      const customSignal = this.options.getTokenRequestSignal?.();
      const signal = customSignal
        ? AbortSignal.any([timeout.signal, customSignal])
        : timeout.signal;
      const abort = createAbortPromise(signal);

      try {
        // Guard against Response implementations that do not propagate request aborts to json().
        return await Promise.race([this.requestAccessToken(signal), abort.promise]);
      } finally {
        abort.clear();
      }
    } catch (error: unknown) {
      if (error instanceof ClientCredentialsError) {
        throw error;
      }

      throw new ClientCredentialsError(
        `Failed to fetch access token: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error }
      );
    } finally {
      timeout.clear();
    }
  }

  private async requestAccessToken(signal: AbortSignal): Promise<AccessToken> {
    const now = new Date();
    const response = await fetch(this.options.tokenEndpoint, {
      method: 'POST',
      redirect: 'error',
      signal,
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

    return {
      value: String(data.access_token),
      expiresAt: Math.floor(now.getTime() / 1000) + data.expires_in,
      scope: 'scope' in data && typeof data.scope === 'string' ? data.scope : undefined,
    };
  }
}
