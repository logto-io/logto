import { ConnectorType } from '@logto/schemas';

import {
  mockEmailConnectorConfig,
  mockEmailConnectorId,
  mockSmsConnectorConfig,
  mockSmsConnectorId,
  mockSocialConnectorConfig,
  mockSocialConnectorId,
} from '#src/__mocks__/connectors-mock.js';
import { deleteConnectorById, listConnectors, postConnector } from '#src/api/index.js';
import { deleteSsoConnectorById, getSsoConnectors } from '#src/api/sso-connector.js';

export const clearConnectorsByTypes = async (types: ConnectorType[]) => {
  const connectors = await listConnectors();
  const targetConnectors = connectors.filter((connector) => types.includes(connector.type));
  await Promise.all(targetConnectors.map(async (connector) => deleteConnectorById(connector.id)));
};

export const clearSsoConnectors = async () => {
  const ssoConnectors = await getSsoConnectors();
  await Promise.all(ssoConnectors.map(async (connector) => deleteSsoConnectorById(connector.id)));
};

export const clearConnectorById = async (id: string) => deleteConnectorById(id);

export const setEmailConnector = async () =>
  postConnector({
    connectorId: mockEmailConnectorId,
    config: mockEmailConnectorConfig,
  });

export const setSmsConnector = async () =>
  postConnector({
    connectorId: mockSmsConnectorId,
    config: mockSmsConnectorConfig,
  });

export const setSocialConnector = async () =>
  postConnector({
    connectorId: mockSocialConnectorId,
    config: mockSocialConnectorConfig,
  });

export const resetPasswordlessConnectors = async () => {
  await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  await Promise.all([setEmailConnector(), setSmsConnector()]);
};
