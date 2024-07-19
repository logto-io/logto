import {
  SsoProviderName,
  type CreateSsoConnector,
  type SsoConnector,
  type SsoConnectorProvidersResponse,
} from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { logtoUrl } from '#src/constants.js';
import { randomString } from '#src/utils.js';

export type SsoConnectorWithProviderConfig = SsoConnector & {
  providerLogo: string;
  providerLogoDark: string;
  providerConfig?: Record<string, unknown>;
};

export const getSsoConnectorFactories = async () =>
  authedAdminApi.get('sso-connector-providers').json<SsoConnectorProvidersResponse>();

export const createSsoConnector = async (data: Partial<CreateSsoConnector>) =>
  authedAdminApi
    .post('sso-connectors', {
      json: data,
    })
    .json<SsoConnector>();

export const getSsoConnectors = async () =>
  authedAdminApi.get('sso-connectors').json<SsoConnectorWithProviderConfig[]>();

export const getSsoConnectorById = async (id: string) =>
  authedAdminApi.get(`sso-connectors/${id}`).json<SsoConnectorWithProviderConfig>();

export const deleteSsoConnectorById = async (id: string) =>
  authedAdminApi.delete(`sso-connectors/${id}`).json<void>();

export const patchSsoConnectorById = async (id: string, data: Partial<SsoConnector>) =>
  authedAdminApi
    .patch(`sso-connectors/${id}`, {
      json: data,
    })
    .json<SsoConnectorWithProviderConfig>();

export class SsoConnectorApi {
  readonly connectorInstances = new Map<string, SsoConnector>();

  async createMockOidcConnector(domains: string[], connectorName?: string) {
    const connector = await this.create({
      providerName: SsoProviderName.OIDC,
      connectorName: connectorName ?? `test-oidc-${randomString()}`,
      domains,
      config: {
        clientId: 'foo',
        clientSecret: 'bar',
        issuer: `${logtoUrl}/oidc`,
      },
      syncProfile: true,
    });

    return connector;
  }

  async create(data: Partial<CreateSsoConnector>): Promise<SsoConnector> {
    const connector = await createSsoConnector(data);

    this.connectorInstances.set(connector.id, connector);
    return connector;
  }

  async delete(id: string) {
    await deleteSsoConnectorById(id);
    this.connectorInstances.delete(id);
  }

  async cleanUp() {
    await Promise.all(
      Array.from(this.connectorInstances.keys()).map(async (id) => this.delete(id))
    );
  }

  get firstConnectorId() {
    return Array.from(this.connectorInstances.keys())[0];
  }
}
