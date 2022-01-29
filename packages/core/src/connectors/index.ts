import RequestError from '@/errors/RequestError';
import { findConnectorById, hasConnector, insertConnector } from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import * as AliyunSMS from './aliyun-sms';
import * as GitHub from './github';
import { ConnectorInstance, ConnectorType } from './types';

const allConnectors: ConnectorInstance[] = [AliyunDM, AliyunSMS, GitHub];

export const getConnectorInstances = async (): Promise<ConnectorInstance[]> => {
  return Promise.all(
    allConnectors.map(async (element) => {
      const connector = await findConnectorById(element.metadata.id);

      return { connector, ...element };
    })
  );
};

export const getConnectorInstanceById = async (id: string): Promise<ConnectorInstance> => {
  const found = allConnectors.find((element) => element.metadata.id === id);

  if (!found) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  const connector = await findConnectorById(id);

  return { connector, ...found };
};

export const getConnectorInstanceByType = async <T extends ConnectorInstance>(
  type: ConnectorType
): Promise<T> => {
  const connectors = await getConnectorInstances();
  const connector = connectors
    .filter((connector) => connector.connector?.enabled)
    .find<T>((connector): connector is T => connector.metadata.type === type);

  if (!connector) {
    throw new RequestError('connector.not_found', { type });
  }

  return connector;
};

export const initConnectors = async () => {
  await Promise.all(
    allConnectors.map(async ({ metadata: { id } }) => {
      if (await hasConnector(id)) {
        return;
      }

      await insertConnector({
        id,
      });
    })
  );
};
