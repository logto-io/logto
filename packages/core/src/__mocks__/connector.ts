import { ConnectorPlatform } from '@logto/connector-types';
import { Connector, ConnectorMetadata, ConnectorType } from '@logto/schemas';

export const mockMetadata: ConnectorMetadata = {
  id: 'id',
  target: 'connector',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'Connector',
    'zh-CN': '连接器',
    'tr-TR': 'Connector',
    'ko-KR': 'Connector',
  },
  logo: './logo.png',
  logoDark: './logo-dark.png',
  description: {
    en: 'Connector',
    'zh-CN': '连接器',
    'tr-TR': 'Connector',
    'ko-KR': 'Connector',
  },
  readme: 'README.md',
  configTemplate: 'config-template.json',
};

export const mockConnector: Connector = {
  id: 'id',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_123,
};

const mockMetadata0: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id0',
  target: 'connector_0',
  type: ConnectorType.Email,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata1: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id1',
  target: 'connector_1',
  type: ConnectorType.SMS,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata2: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id2',
  target: 'connector_2',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata3: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id3',
  target: 'connector_3',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata4: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id4',
  target: 'connector_4',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata5: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id5',
  target: 'connector_5',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata6: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id6',
  target: 'connector_6',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockConnector0: Connector = {
  id: 'id0',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_123,
};

const mockConnector1: Connector = {
  id: 'id1',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_234,
};

const mockConnector2: Connector = {
  id: 'id2',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_345,
};

const mockConnector3: Connector = {
  id: 'id3',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_456,
};

const mockConnector4: Connector = {
  id: 'id4',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_567,
};

const mockConnector5: Connector = {
  id: 'id5',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_567,
};

const mockConnector6: Connector = {
  id: 'id6',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_567,
};

export const mockConnectorList: Connector[] = [
  mockConnector0,
  mockConnector1,
  mockConnector2,
  mockConnector3,
  mockConnector4,
  mockConnector5,
  mockConnector6,
];

export const mockConnectorInstanceList: Array<{
  connector: Connector;
  metadata: ConnectorMetadata;
}> = [
  {
    connector: mockConnector0,
    metadata: { ...mockMetadata0, type: ConnectorType.Social },
  },
  {
    connector: mockConnector1,
    metadata: mockMetadata1,
  },
  {
    connector: mockConnector2,
    metadata: mockMetadata2,
  },
  {
    connector: mockConnector3,
    metadata: mockMetadata3,
  },
  {
    connector: mockConnector4,
    metadata: { ...mockMetadata4, type: ConnectorType.Email, platform: null },
  },
  {
    connector: mockConnector5,
    metadata: { ...mockMetadata5, type: ConnectorType.SMS, platform: null },
  },
  {
    connector: mockConnector6,
    metadata: { ...mockMetadata6, type: ConnectorType.Email, platform: null },
  },
];

export const mockAliyunDmConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'aliyun-dm',
  },
  metadata: {
    ...mockMetadata,
    id: 'aliyun-dm',
    target: 'aliyun-dm',
    type: ConnectorType.Email,
    platform: null,
  },
};

export const mockAliyunSmsConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'aliyun-sms',
  },
  metadata: {
    ...mockMetadata,
    id: 'aliyun-sms',
    target: 'aliyun-sms',
    type: ConnectorType.SMS,
    platform: null,
  },
};

export const mockFacebookConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'facebook',
  },
  metadata: {
    ...mockMetadata,
    id: 'facebook',
    target: 'facebook',
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Web,
  },
};

export const mockGithubConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'github',
  },
  metadata: {
    ...mockMetadata,
    id: 'github',
    target: 'github',
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Web,
  },
};

export const mockWechatConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'wechat-web',
  },
  metadata: {
    ...mockMetadata,
    id: 'wechat-web',
    target: 'wechat',
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Web,
  },
};

export const mockWechatNativeConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'wechat-native',
  },
  metadata: {
    ...mockMetadata,
    id: 'wechat-native',
    target: 'wechat',
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Native,
  },
};

export const mockGoogleConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'google',
    enabled: false,
  },
  metadata: {
    ...mockMetadata,
    id: 'google',
    target: 'google',
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Web,
  },
};

export const mockConnectorInstances = [
  mockAliyunDmConnectorInstance,
  mockAliyunSmsConnectorInstance,
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
  mockWechatConnectorInstance,
  mockWechatNativeConnectorInstance,
];
