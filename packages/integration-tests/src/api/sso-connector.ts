import { type CreateSsoConnector, type SsoConnector } from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';

export type ConnectorFactoryDetail = {
  providerName: string;
  logo: string;
  description: string;
};

export type ConnectorFactoryResponse = {
  standardConnectors: ConnectorFactoryDetail[];
  providerConnectors: ConnectorFactoryDetail[];
};

export type SsoConnectorWithProviderConfig = SsoConnector & {
  providerLogo: string;
  providerConfig?: Record<string, unknown>;
};

export const getSsoConnectorFactories = async () =>
  authedAdminApi.get('sso-connector-factories').json<ConnectorFactoryResponse>();

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
