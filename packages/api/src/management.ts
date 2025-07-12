import createClient, { type Client } from 'openapi-fetch';

import { ClientCredentials } from './client-credentials.js';
import { type paths } from './generated-types/management.js';

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
   */
  baseUrl?: string;
  /**
   * Override the API indicator for the management API.
   * Useful for testing or custom deployments.
   */
  apiIndicator?: string;
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

type ManagementApiReturnType = {
  /**
   * The API client for the Management API.
   *
   * This client is configured to use the provided client credentials
   * and will automatically include the access token in requests.
   */
  apiClient: Client<paths>;
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
 * const response = await apiClient.GET('/api/users');
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
  const { clientId, clientSecret } = options;
  const baseUrl = options.baseUrl ?? getBaseUrl(tenantId);
  const apiIndicator = options.apiIndicator ?? getManagementApiIndicator(tenantId);
  const clientCredentials = new ClientCredentials({
    clientId,
    clientSecret,
    tokenEndpoint: `${baseUrl}/oidc/token`,
    tokenParams: {
      resource: apiIndicator,
      scope: allScope,
    },
  });
  const apiClient = createClient<paths>({
    baseUrl,
  });

  apiClient.use({
    async onRequest({ schemaPath, request }) {
      if (schemaPath.includes('/.well-known/')) {
        // Skip auth for well-known endpoints
        return;
      }
      const { value, scope } = await clientCredentials.getAccessToken();

      if (scope !== allScope) {
        console.warn(
          `The scope "${scope}" is not equal to the expected value "${allScope}". This may cause issues with API access. See https://a.logto.io/m2m-mapi to learn more about configuring machine-to-machine access to the Management API.`
        );
      }

      request.headers.set('Authorization', `Bearer ${value}`);
      return request;
    },
  });

  return {
    apiClient,
    clientCredentials,
  };
}
