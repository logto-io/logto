import { AlipayConnector } from '@logto/connector-alipay';
import { AliyunDmConnector } from '@logto/connector-aliyun-dm';
import { AliyunSmsConnector } from '@logto/connector-aliyun-sms';
import { FacebookConnector } from '@logto/connector-facebook';
import { GithubConnector } from '@logto/connector-github';
import { GoogleConnector } from '@logto/connector-google';
import { SmsConnector, EmailConnector, SocialConnector } from '@logto/connector-types';
import { WeChatConnector } from '@logto/connector-wechat';
import { WeChatNativeConnector } from '@logto/connector-wechat-native';

import RequestError from '@/errors/RequestError';
import { findAllConnectors, findConnectorById, insertConnector } from '@/queries/connector';

import { ConnectorInstance, ConnectorType, IConnector, SocialConnectorInstance } from './types';
import { getConnectorConfig, getConnectorRequestTimeout, getFormattedDate } from './utilities';

const AlipayIConnector = new AlipayConnector(
  getConnectorConfig,
  getConnectorRequestTimeout,
  getFormattedDate
) as SocialConnector;

const AliyunDmIConnector = new AliyunDmConnector(getConnectorConfig) as EmailConnector;

const AliyunSmsIConnector = new AliyunSmsConnector(getConnectorConfig) as SmsConnector;

const FacebookIConnector = new FacebookConnector(
  getConnectorConfig,
  getConnectorRequestTimeout
) as SocialConnector;

const GithubIConnector = new GithubConnector(
  getConnectorConfig,
  getConnectorRequestTimeout
) as SocialConnector;

const GoogleIConnector = new GoogleConnector(
  getConnectorConfig,
  getConnectorRequestTimeout
) as SocialConnector;

const WeChatIConnector = new WeChatConnector(
  getConnectorConfig,
  getConnectorRequestTimeout
) as SocialConnector;

const WeChatNativeIConnector = new WeChatNativeConnector(
  getConnectorConfig,
  getConnectorRequestTimeout
) as SocialConnector;

const allConnectors: IConnector[] = [
  AlipayIConnector,
  AliyunDmIConnector,
  AliyunSmsIConnector,
  FacebookIConnector,
  GithubIConnector,
  GoogleIConnector,
  WeChatIConnector,
  WeChatNativeIConnector,
];

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
  const existingConnectors = new Map(connectors.map((connector) => [connector.id, connector]));
  const newConnectors = allConnectors.filter(
    ({ metadata: { id, type } }) => existingConnectors.get(id)?.type !== type
  );
  await Promise.all(
    newConnectors.map(async ({ metadata: { id, type } }) => insertConnector({ id, type }))
  );
};
