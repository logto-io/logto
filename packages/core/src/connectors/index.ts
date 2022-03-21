import RequestError from '@/errors/RequestError';
import {
  findAllConnectors,
  findConnectorById,
  hasConnector,
  insertConnector,
} from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import * as AliyunSMS from './aliyun-sms';
import * as Facebook from './facebook';
import * as GitHub from './github';
import * as Google from './google';
import { ConnectorInstance, ConnectorType, IConnector, SocialConnectorInstance } from './types';
import * as WeChat from './wechat';

const allConnectors: IConnector[] = [AliyunDM, AliyunSMS, Facebook, GitHub, Google, WeChat];

export const getConnectorInstances = async (): Promise<ConnectorInstance[]> => {
  const connectors = await findAllConnectors();
  const connectorMap = new Map(connectors.map((connector) => [connector.id, connector]));

  return allConnectors.map((element) => {
    const { id } = element.metadata;
    const connector = connectorMap.get(id);

    if (!connector) {
      throw new RequestError({ code: 'entity.not_found', id, status: 404 });
    }

    return { connector, ...element };
  });
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
): connector is SocialConnectorInstance => {
  return connector.metadata.type === ConnectorType.Social;
};

export const getSocialConnectorInstanceById = async (
  id: string
): Promise<SocialConnectorInstance> => {
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

export const getEnabledSocialConnectorIds = async <T extends ConnectorInstance>(): Promise<
  string[]
> => {
  const connectorInstances = await getConnectorInstances();

  return connectorInstances
    .filter<T>(
      (instance): instance is T =>
        instance.connector.enabled && instance.metadata.type === ConnectorType.Social
    )
    .map((instance) => instance.metadata.id);
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
