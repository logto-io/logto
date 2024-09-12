import { ConnectorType } from '@logto/schemas';
import { type KyInstance } from 'ky';

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

export const clearConnectorsByTypes = async (types: ConnectorType[], api?: KyInstance) => {
  const connectors = await listConnectors(api);
  const targetConnectors = connectors.filter((connector) => types.includes(connector.type));
  await Promise.all(
    targetConnectors.map(async (connector) => deleteConnectorById(connector.id, api))
  );
};

export const clearSsoConnectors = async () => {
  const ssoConnectors = await getSsoConnectors();
  await Promise.all(ssoConnectors.map(async (connector) => deleteSsoConnectorById(connector.id)));
};

export const clearConnectorById = async (id: string) => deleteConnectorById(id);

export const setEmailConnector = async (api?: KyInstance) =>
  postConnector(
    {
      connectorId: mockEmailConnectorId,
      config: mockEmailConnectorConfig,
    },
    api
  );

export const setSmsConnector = async (api?: KyInstance) =>
  postConnector(
    {
      connectorId: mockSmsConnectorId,
      config: mockSmsConnectorConfig,
    },
    api
  );

export const setSocialConnector = async (api?: KyInstance) =>
  postConnector(
    {
      connectorId: mockSocialConnectorId,
      config: mockSocialConnectorConfig,
      syncProfile: true,
    },
    api
  );

export const resetPasswordlessConnectors = async () => {
  await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  await Promise.all([setEmailConnector(), setSmsConnector()]);
};
