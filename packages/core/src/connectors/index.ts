import { notFalsy } from '@silverhand/essentials';

import RequestError from '@/errors/RequestError';
import {
  findAllConnectors,
  findAllEnabledConnectors,
  findConnectorById,
  insertConnector,
} from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import * as AliyunSMS from './aliyun-sms';
import * as Facebook from './facebook';
import * as GitHub from './github';
import * as Google from './google';
import { ConnectorInstance, ConnectorType, IConnector, SocialConnectorInstance } from './types';
import * as WeChat from './wechat';

const allBaseConnectors: IConnector[] = [AliyunDM, AliyunSMS, Facebook, GitHub, Google, WeChat];

export const getConnectorInstances = async (): Promise<ConnectorInstance[]> => {
  const connectors = await findAllConnectors();
  const connectorMap = new Map(connectors.map((connector) => [connector.id, connector]));

  return allBaseConnectors.map((baseConnector) => {
    const { id } = baseConnector.metadata;
    const connector = connectorMap.get(id);

    if (!connector) {
      throw new RequestError({ code: 'entity.not_found', id, status: 404 });
    }

    return { connector, ...baseConnector };
  });
};

export const getConnectorInstanceById = async (id: string): Promise<ConnectorInstance> => {
  const foundBaseConnector = allBaseConnectors.find(
    (baseConnector) => baseConnector.metadata.id === id
  );

  if (!foundBaseConnector) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  const connector = await findConnectorById(id);

  return { connector, ...foundBaseConnector };
};

export const getEnabledConnectorInstances = async <T extends ConnectorInstance>(): Promise<T[]> => {
  const enabledConnectors = await findAllEnabledConnectors();
  const enabledConnectorMap = new Map(
    enabledConnectors.map((connector) => [connector.id, connector])
  );

  return allBaseConnectors
    .map((baseConnector) => {
      const { id } = baseConnector.metadata;
      const connector = enabledConnectorMap.get(id);

      return connector ? { connector, ...baseConnector } : undefined;
    })
    .filter((connectorInstance): connectorInstance is T => notFalsy(connectorInstance));
};

const isSocialConnectorInstance = (
  connector: ConnectorInstance
): connector is SocialConnectorInstance => {
  return connector.metadata.type === ConnectorType.Social;
};

export const getSocialConnectorInstanceById = async (
  id: string
): Promise<SocialConnectorInstance> => {
  const connectorInstance = await getConnectorInstanceById(id);

  if (!isSocialConnectorInstance(connectorInstance)) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  return connectorInstance;
};

export const getEnabledSocialConnectorIds = async <T extends ConnectorInstance>(): Promise<
  string[]
> => {
  const enabledConnectorInstances = await getEnabledConnectorInstances();

  return enabledConnectorInstances
    .filter<T>((instance): instance is T => isSocialConnectorInstance(instance))
    .map((instance) => instance.metadata.id);
};

export const getConnectorInstanceByType = async <T extends ConnectorInstance>(
  type: ConnectorType
): Promise<T> => {
  const connectors = await getConnectorInstances();
  const connector = connectors.find<T>(
    (connector): connector is T => connector.connector.enabled && connector.metadata.type === type
  );

  if (!connector) {
    throw new RequestError({ code: 'connector.not_found', type });
  }

  return connector;
};

export const initConnectors = async () => {
  const connectors = await findAllConnectors();
  const existingConnectorIds = new Set(connectors.map((connector) => connector.id));

  await Promise.all(
    allBaseConnectors.map(async ({ metadata: { id } }) => {
      if (existingConnectorIds.has(id)) {
        return;
      }

      await insertConnector({ id });
    })
  );
};
