import { ConnectorConfig, ConnectorType } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import { findConnectorByIdAndType, updateConnector } from '@/queries/connector';

export const getConnectorConfig = async <T extends ConnectorConfig>(
  id: string,
  type: ConnectorType
): Promise<T> => {
  const connector = await findConnectorByIdAndType(id, type);
  if (!connector) {
    throw new RequestError({
      code: 'entity.not_exists_with_id',
      name: 'connector',
      id,
      status: 404,
    });
  }

  return connector.config as T;
};

export const updateConnectorConfig = async <T extends ConnectorConfig>(
  id: string,
  type: ConnectorType,
  config: T
): Promise<void> => {
  await updateConnector({
    where: { id, type },
    set: { config },
  });
};
