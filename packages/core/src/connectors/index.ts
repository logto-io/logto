import RequestError from '@/errors/RequestError';
import { findConnectorById, hasConnector, insertConnector } from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import * as AliyunSMS from './aliyun-sms';
import * as GitHub from './github';
import * as Google from './google';
import { ConnectorInstance, ConnectorType, IConnector, SocialConectorInstance } from './types';

const allConnectors: IConnector[] = [AliyunDM, AliyunSMS, GitHub, Google];

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

const isSocialConnectorInstance = (
  connector: ConnectorInstance
): connector is SocialConectorInstance => {
  return connector.metadata.type === ConnectorType.Social;
};

export const getSocialConnectorInstanceById = async (
  id: string
): Promise<SocialConectorInstance> => {
  const connector = await getConnectorInstanceById(id);

  if (!isSocialConnectorInstance(connector)) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  return connector;
};

export const getConnectorInstanceByType = async <T extends ConnectorInstance>(
  type: ConnectorType
): Promise<T> => {
  const connectors = await getConnectorInstances();
  const connector = connectors
    .filter((connector) => connector.connector.enabled)
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
