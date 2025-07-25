import {
  type CreateSsoConnectorIdpInitiatedAuthConfig,
  SsoProviderName,
  type CreateSsoConnector,
  type SsoConnector,
  type SsoConnectorProvidersResponse,
  type SsoConnectorIdpInitiatedAuthConfig,
} from '@logto/schemas';

import { metadataXml } from '#src/__mocks__/sso-connectors-mock.js';
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

export const clearSsoConnectors = async () => {
  const connectors = await getSsoConnectors();
  await Promise.all(connectors.map(async (connector) => deleteSsoConnectorById(connector.id)));
};

export class SsoConnectorApi {
  readonly connectorInstances = new Map<string, SsoConnector>();

  async createMockOidcConnector(
    domains: string[],
    connectorName?: string,
    enableTokenStorage?: boolean
  ) {
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
      enableTokenStorage,
    });

    return connector;
  }

  async createMockSamlConnector(domains: string[], connectorName?: string, metadata?: string) {
    const connector = await this.create({
      providerName: SsoProviderName.SAML,
      connectorName: connectorName ?? `test-saml-${randomString()}`,
      domains,
      config: {
        metadata: metadata ?? metadataXml,
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

  async update(id: string, data: Partial<SsoConnector>) {
    const updatedConnector = await patchSsoConnectorById(id, data);
    this.connectorInstances.set(updatedConnector.id, updatedConnector);
    return updatedConnector;
  }

  async getSsoConnectorById(id: string) {
    return getSsoConnectorById(id);
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

  async setSsoConnectorIdpInitiatedAuthConfig(data: CreateSsoConnectorIdpInitiatedAuthConfig) {
    const { connectorId, ...rest } = data;
    return authedAdminApi
      .put(`sso-connectors/${connectorId}/idp-initiated-auth-config`, {
        json: rest,
      })
      .json<SsoConnectorIdpInitiatedAuthConfig>();
  }

  async getSsoConnectorIdpInitiatedAuthConfig(connectorId: string) {
    return authedAdminApi
      .get(`sso-connectors/${connectorId}/idp-initiated-auth-config`)
      .json<SsoConnectorIdpInitiatedAuthConfig>();
  }

  async deleteSsoConnectorIdpInitiatedAuthConfig(connectorId: string) {
    return authedAdminApi
      .delete(`sso-connectors/${connectorId}/idp-initiated-auth-config`)
      .json<void>();
  }

  get firstConnectorId() {
    return Array.from(this.connectorInstances.keys())[0];
  }
}
