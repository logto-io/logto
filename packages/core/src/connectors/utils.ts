import { ConnectorConfig, ConnectorType } from '@logto/schemas';

import { findConnectorByIdAndType, updateConnector } from '@/queries/connector';

export const getConnectorConfig = async (
  id: string,
  type: ConnectorType
): Promise<ConnectorConfig> => {
  const connector = await findConnectorByIdAndType(id, type);
  if (!connector) {
    throw new Error('Can not find connector in database');
  }

  return connector.config;
};

export const updateConnectorConfig = async (
  id: string,
  type: ConnectorType,
  config: ConnectorConfig
): Promise<void> => {
  await updateConnector({
    where: { id, type },
    set: { config },
  });
};
