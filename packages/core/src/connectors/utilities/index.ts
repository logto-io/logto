import { GetTimeout, GetTimestamp } from '@logto/connector-types';
import { ArbitraryObject } from '@logto/schemas';
import dayjs from 'dayjs';

import { findConnectorById, updateConnector } from '@/queries/connector';

export const getConnectorConfig = async <T extends ArbitraryObject>(id: string) => {
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

export const getConnectorRequestTimeout: GetTimeout = async () => connectorRequestTimeout;

export const getFormattedDate: GetTimestamp = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
};
