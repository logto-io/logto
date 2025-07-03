import createClient from 'openapi-fetch';

import { ClientCredentials } from './client-credentials.js';
import { type paths } from './generated-types/management.js';

type CreateManagementApiOptions = {
  clientId: string;
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

const getBaseUrl = (tenantId: string) => `https://${tenantId}.logto.app`;
const getManagementApiIndicator = (tenantId: string) => `${getBaseUrl(tenantId)}/api`;

export function createManagementApi(tenantId: string, options: CreateManagementApiOptions) {
  const { clientId, clientSecret } = options;
  const baseUrl = options.baseUrl ?? getBaseUrl(tenantId);
  const apiIndicator = options.apiIndicator ?? getManagementApiIndicator(tenantId);
  const clientCredentials = new ClientCredentials({
    clientId,
    clientSecret,
    tokenEndpoint: `${baseUrl}/oidc/token`,
    tokenParams: {
      resource: apiIndicator,
      scope: 'all',
    },
  });
  const apiClient = createClient<paths>({
    baseUrl,
  });

  apiClient.use({
    async onRequest({ schemaPath, request }) {
      if (schemaPath.includes('/.well-known/')) {
        // Skip authentication for well-known endpoints
        return;
      }
      const accessToken = await clientCredentials.getAccessToken();
      request.headers.set('Authorization', `Bearer ${accessToken}`);
      return request;
    },
  });

  return {
    apiClient,
    clientCredentials,
  };
}
