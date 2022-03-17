import { notFalsy } from '@silverhand/essentials';

import RequestError from '@/errors/RequestError';
import {
  findConnectorById,
  findConnectorsByIds,
  hasConnector,
  insertConnector,
} from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import * as AliyunSMS from './aliyun-sms';
import * as Facebook from './facebook';
import * as GitHub from './github';
import * as Google from './google';
import { ConnectorInstance, ConnectorType, IConnector, SocialConnectorInstance } from './types';

const allConnectors: IConnector[] = [AliyunDM, AliyunSMS, Facebook, GitHub, Google];

export const getConnectorInstances = async (): Promise<ConnectorInstance[]> => {
  const allConnectorIds = allConnectors.map((connector) => connector.metadata.id);
  const connectors = await findConnectorsByIds(allConnectorIds);
  const connectorMap = new Map(connectors.map((connector) => [connector.id, connector]));
  const connectorInstances = allConnectors
    .map((element) => {
      const connector = connectorMap.get(element.metadata.id);

      if (!connector) {
        return;
      }

      return { connector, ...element };
    })
    .filter((entry): entry is ConnectorInstance => notFalsy(entry));

  return Promise.all(connectorInstances);
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

export const getEnabledConnectorInstanceByType = async <T extends ConnectorInstance>(
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
