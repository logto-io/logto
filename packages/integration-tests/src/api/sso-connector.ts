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

export const getSsoConnectorFactories = async () =>
  authedAdminApi.get('sso-connector-factories').json<ConnectorFactoryResponse>();
