import { ConnectorConfig, ConnectorType } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import { findConnectorByIdAndType, updateConnector } from '@/queries/connector';

export const getConnectorConfig = async (
  id: string,
  type: ConnectorType
): Promise<ConnectorConfig> => {
  const connector = await findConnectorByIdAndType(id, type);
  if (!connector) {
    throw new RequestError({
      code: 'entity.not_exists_with_id',
      name: 'connector',
      id,
      status: 404,
    });
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
