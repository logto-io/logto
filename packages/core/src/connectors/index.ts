import { AlipayConnector } from '@logto/connector-alipay';
import { AliyunDmConnector } from '@logto/connector-aliyun-dm';
import { AliyunSmsConnector } from '@logto/connector-aliyun-sms';
import { FacebookConnector } from '@logto/connector-facebook';
import { GithubConnector } from '@logto/connector-github';
import { GoogleConnector } from '@logto/connector-google';
import { WeChatConnector } from '@logto/connector-wechat';
import { WeChatNativeConnector } from '@logto/connector-wechat-native';
import { nanoid } from 'nanoid';

import RequestError from '@/errors/RequestError';
import { findAllConnectors, findConnectorById, insertConnector } from '@/queries/connector';

import { ConnectorInstance, ConnectorType, IConnector, SocialConnectorInstance } from './types';
import { buildIndexWithTargetAndPlatform, getConnectorConfig } from './utilities';

const allConnectors: IConnector[] = [
  new AlipayConnector(getConnectorConfig),
  new AliyunDmConnector(getConnectorConfig),
  new AliyunSmsConnector(getConnectorConfig),
  new FacebookConnector(getConnectorConfig),
  new GithubConnector(getConnectorConfig),
  new GoogleConnector(getConnectorConfig),
  new WeChatConnector(getConnectorConfig),
  new WeChatNativeConnector(getConnectorConfig),
];

export const getConnectorInstances = async (): Promise<ConnectorInstance[]> => {
  const connectors = await findAllConnectors();
  const connectorMap = new Map(
    connectors.map((connector) => [
      buildIndexWithTargetAndPlatform(connector.target, connector.platform),
      connector,
    ])
  );

  return allConnectors.map((element) => {
    const { target, platform } = element.metadata;
    const connector = connectorMap.get(buildIndexWithTargetAndPlatform(target, platform));

    if (!connector) {
      throw new RequestError({ code: 'entity.not_found', target, platform, status: 404 });
    }

    return { connector, ...element };
  });
};

export const getConnectorInstanceById = async (id: string): Promise<ConnectorInstance> => {
  const connector = await findConnectorById(id);

  const found = allConnectors.find(
    (element) =>
      element.metadata.target === connector.target &&
      element.metadata.platform === connector.platform
  );

  if (!found) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

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
    .map((instance) => instance.connector.id);
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
  const existingConnectors = new Map(
    connectors.map((connector) => [
      buildIndexWithTargetAndPlatform(connector.target, connector.platform),
      connector,
    ])
  );
  const newConnectors = allConnectors.filter(
    ({ metadata: { target, platform } }) =>
      existingConnectors.get(buildIndexWithTargetAndPlatform(target, platform))?.platform !==
      platform
  );

  await Promise.all(
    newConnectors.map(async ({ metadata: { target, platform } }) => {
      const id = nanoid();
      await insertConnector({
        id,
        target,
        platform,
      });
    })
  );
};
