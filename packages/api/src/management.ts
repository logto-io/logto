import createClient, { type Client } from 'openapi-fetch';

import { ClientCredentials } from './client-credentials.js';
import { type paths } from './generated-types/management.js';
import { normalizeTimeout, toTimeoutMilliseconds } from './timeout.js';

/**
 * Options for creating a Management API client.
 */
export type CreateManagementApiOptions = {
  /**
   * The client ID for the machine-to-machine application in Logto. This application must be
   * granted access to the Management API.
   * @see https://a.logto.io/m2m-mapi for more details on configuring machine-to-machine access.
   */
  clientId: string;
  /**
   * The client secret for the machine-to-machine application in Logto.
   * This should be kept secure and not exposed in client-side code.
   */
  clientSecret: string;
  /**
   * Override the base URL generated from the tenant ID.
   * Useful for testing or custom deployments.
   * Trailing slashes are ignored.
   */
  baseUrl?: string;
  /**
   * Override the API indicator for the management API.
   * Useful for testing or custom deployments.
   */
  apiIndicator?: string;
  /**
   * The maximum time in seconds allowed for fetching an access token.
   * Non-positive and infinite values disable the timeout. `NaN` uses the default value.
   * @default 10
   */
  tokenRequestTimeout?: number;
  /**
   * Returns an optional signal for each token request. The factory is called once per actual token
   * fetch, so concurrent callers sharing a fetch also share its signal. The signal is composed with
   * `tokenRequestTimeout`, and the first signal to abort cancels the request.
   */
  getTokenRequestSignal?: () => AbortSignal | undefined;
  /**
   * The maximum time in seconds allowed for the Management API network request after token
   * retrieval. It is composed with per-request signals, and a timeout rejects the API call.
   * Non-positive and infinite values disable the timeout. `NaN` uses the default value.
   * @default 10
   */
  requestTimeout?: number;
};

/**
 * Options for creating an API client with custom token authentication.
 */
export type CreateApiClientOptions = {
  /**
   * The base URL for the Management API.
   * Trailing slashes are ignored.
   */
  baseUrl: string;
  /**
   * A function that returns a promise resolving to the access token.
   * This function will be called for each request that requires authentication.
   */
  getToken: () => Promise<string>;
  /**
   * The maximum time in seconds allowed for the API network request after `getToken()` resolves.
   * It is composed with per-request signals, and a timeout rejects the API call.
   * Non-positive and infinite values disable the timeout. `NaN` uses the default value.
   * @default 10
   */
  requestTimeout?: number;
};

/**
 * Returns the base URL for the Management API based on the tenant ID.
 * @param tenantId The tenant ID to construct the base URL.
 * @returns The base URL for the Management API.
 */
export const getBaseUrl = (tenantId: string) => `https://${tenantId}.logto.app`;

/**
 * Returns the API indicator for the Management API based on the tenant ID.
 * This will be used as the `resource` parameter when requesting an access token.
 * @param tenantId The tenant ID to construct the API indicator.
 * @returns The API indicator for the Management API.
 */
export const getManagementApiIndicator = (tenantId: string) => `${getBaseUrl(tenantId)}/api`;

/**
 * The scope used for accessing all endpoints of the Management API.
 * This is used when requesting an access token for the Management API.
 */
export const allScope = 'all';

const bearerTokenPrefix = 'Bearer ';

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/u, '');

const isWellKnownPath = (schemaPath: string) => schemaPath.includes('/.well-known/');

const createRequestTimeoutFetch =
  (requestTimeout: number) => async (request: Request, requestInit?: RequestInit) => {
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(toTimeoutMilliseconds(requestTimeout)),
    ]);
    return fetch(request, { ...requestInit, signal });
  };

type LowercaseHttpMethods = {
  get: Client<paths>['GET'];
  put: Client<paths>['PUT'];
  post: Client<paths>['POST'];
  delete: Client<paths>['DELETE'];
  options: Client<paths>['OPTIONS'];
  head: Client<paths>['HEAD'];
  patch: Client<paths>['PATCH'];
  trace: Client<paths>['TRACE'];
};

/** A typed Management API client with lowercase HTTP methods. */
export type ManagementApiClient = Client<paths> & LowercaseHttpMethods;

const addLowercaseHttpMethods = (client: Client<paths>): ManagementApiClient =>
  // eslint-disable-next-line @silverhand/fp/no-mutating-assign -- Keep the original client identity while adding lowercase aliases.
  Object.assign(client, {
    get: client.GET,
    put: client.PUT,
    post: client.POST,
    delete: client.DELETE,
    options: client.OPTIONS,
    head: client.HEAD,
    patch: client.PATCH,
    trace: client.TRACE,
  });

/**
 * Creates an API client with custom token authentication.
 *
 * This function is useful when you need full control over the authentication flow,
 * such as custom token sources.
 *
 * The client automatically skips authentication for `.well-known` endpoints.
 *
 * @param options The options including base URL and token getter function.
 * @returns A configured API client with type-safe methods.
 * @example
 * ```ts
 * import { createApiClient } from '@logto/api/management';
 *
 * const client = createApiClient({
 *   baseUrl: 'https://my-tenant.logto.app',
 *   getToken: async () => getYourToken(),
 * });
 *
 * const response = await client.get('/api/applications/{id}', {
 *   params: { path: { id: 'app-id' } },
 * });
 * ```
 */
export function createApiClient(options: CreateApiClientOptions): ManagementApiClient {
  const { baseUrl, getToken } = options;
  const requestTimeout = normalizeTimeout(options.requestTimeout);
  const client = createClient<paths>({
    baseUrl: normalizeBaseUrl(baseUrl),
    ...(requestTimeout > 0 && { fetch: createRequestTimeoutFetch(requestTimeout) }),
  });

  client.use({
    async onRequest({ schemaPath, request }) {
      if (isWellKnownPath(schemaPath)) {
        return;
      }
      const token = await getToken();
      request.headers.set('Authorization', `${bearerTokenPrefix}${token}`);
      return request;
    },
  });

  return addLowercaseHttpMethods(client);
}

type ManagementApiReturnType = {
  /**
   * The API client for the Management API.
   *
   * This client is configured to use the provided client credentials
   * and will automatically include the access token in requests.
   */
  apiClient: ManagementApiClient;
  /**
   * The client credentials instance used for authentication.
   */
  clientCredentials: ClientCredentials;
};

/**
 * Creates a Management API client with the specified tenant ID and options.
 *
 * Before using this function, ensure that you have created a machine-to-machine application in
 * Logto and granted it access to the Management API. See the documentation for more details:
 *
 * https://a.logto.io/m2m-mapi
 *
 * This function sets up the API client with the necessary authentication using client credentials.
 * It will automatically handle token retrieval and renewal as needed.
 *
 * @param tenantId The tenant ID for which to create the Management API client. For OSS deployments,
 * you can pass any string as the tenant ID, for example, 'default'.
 * @param options The options for creating the Management API client, including client ID and secret.
 * @returns An object containing the API client and client credentials instance.
 * @example
 * ```ts
 * import { createManagementApi } from '@logto/api/management';
 *
 * // Logto Cloud example
 * const { apiClient, clientCredentials } = createManagementApi('my-tenant-id', {
 *   clientId: 'my-client-id',
 *   clientSecret: 'my-client-secret',
 * });
 *
 * // Use apiClient to make requests to the Management API
 * const response = await apiClient.get('/api/users');
 * console.log(response.data);
 * ```
 *
 * @example
 * ```ts
 * // OSS example
 * const { apiClient, clientCredentials } = createManagementApi('default', {
 *   clientId: 'my-client-id',
 *   clientSecret: 'my-client-secret',
 *   baseUrl: 'https://my-oss-logto-instance.com',
 *   apiIndicator: 'https://default.logto.app/api',
 * });
 * ```
 */
export function createManagementApi(
  tenantId: string,
  options: CreateManagementApiOptions
): ManagementApiReturnType {
  const { clientId, clientSecret, tokenRequestTimeout, getTokenRequestSignal, requestTimeout } =
    options;
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? getBaseUrl(tenantId));
  const apiIndicator = options.apiIndicator ?? getManagementApiIndicator(tenantId);
  const clientCredentials = new ClientCredentials({
    clientId,
    clientSecret,
    tokenEndpoint: `${baseUrl}/oidc/token`,
    tokenParams: {
      resource: apiIndicator,
      scope: allScope,
    },
    tokenRequestTimeout,
    getTokenRequestSignal,
  });
  const warnedScopes = new Set<string | undefined>();

  const apiClient = createApiClient({
    baseUrl,
    requestTimeout,
    getToken: async () => {
      const { value, scope } = await clientCredentials.getAccessToken();

      if (scope !== allScope && !warnedScopes.has(scope)) {
        warnedScopes.add(scope);
        console.warn(
          `The scope "${scope}" is not equal to the expected value "${allScope}". This may cause issues with API access. See https://a.logto.io/m2m-mapi to learn more about configuring machine-to-machine access to the Management API.`
        );
      }

      return value;
    },
  });

  apiClient.use({
    onResponse({ schemaPath, request, response }) {
      if (isWellKnownPath(schemaPath)) {
        return;
      }

      const authorization = request.headers.get('Authorization');

      if (!authorization?.startsWith(bearerTokenPrefix)) {
        return;
      }

      const accessToken = authorization.slice(bearerTokenPrefix.length);

      if (response.status === 401) {
        // Do not retry here because the request body may have been consumed.
        clientCredentials.invalidateAccessToken(accessToken);
      } else if (response.ok) {
        clientCredentials.markAccessTokenAsValid(accessToken);
      }
    },
  });

  return {
    apiClient,
    clientCredentials,
  };
}
