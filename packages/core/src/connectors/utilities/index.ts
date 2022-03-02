import { ArbitraryObject } from '@logto/schemas';

import { findConnectorById, updateConnector } from '@/queries/connector';

export const getConnectorConfig = async <T extends ArbitraryObject>(id: string): Promise<T> => {
  const connector = await findConnectorById(id);

  return connector.config as T;
};

export const updateConnectorConfig = async <T extends ArbitraryObject>(
  id: string,
  config: T
): Promise<void> => {
  await updateConnector({
    where: { id },
    set: { config },
  });
};

const connectorRequestTimeout = 5000;

export const getConnectorRequestTimeout = async (): Promise<number> => connectorRequestTimeout;
