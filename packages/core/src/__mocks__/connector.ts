import { ConnectorPlatform } from '@logto/connector-types';
import { Connector, ConnectorMetadata, ConnectorType } from '@logto/schemas';

export const mockMetadata: ConnectorMetadata = {
  target: 'connector',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'Connector',
    'zh-CN': '连接器',
  },
  logo: './logo.png',
  description: {
    en: 'Connector',
    'zh-CN': '连接器',
  },
  readme: 'README.md',
  configTemplate: 'config-template.md',
};

export const mockConnector: Connector = {
  id: 'connector',
  target: 'connector',
  platform: ConnectorPlatform.Universal,
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_123,
};

const mockMetadata0: ConnectorMetadata = {
  ...mockMetadata,
  target: 'connector_0',
  type: ConnectorType.Email,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata1: ConnectorMetadata = {
  ...mockMetadata,
  target: 'connector_1',
  type: ConnectorType.SMS,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata2: ConnectorMetadata = {
  ...mockMetadata,
  target: 'connector_2',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata3: ConnectorMetadata = {
  ...mockMetadata,
  target: 'connector_3',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata4: ConnectorMetadata = {
  ...mockMetadata,
  target: 'connector_4',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata5: ConnectorMetadata = {
  ...mockMetadata,
  target: 'connector_5',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockMetadata6: ConnectorMetadata = {
  ...mockMetadata,
  target: 'connector_6',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
};

const mockConnector0: Connector = {
  id: 'connector_0',
  target: 'connector_0',
  platform: ConnectorPlatform.Universal,
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_123,
};

const mockConnector1: Connector = {
  id: 'connector_1',
  target: 'connector_1',
  platform: ConnectorPlatform.Universal,
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_234,
};

const mockConnector2: Connector = {
  id: 'connector_2',
  target: 'connector_2',
  platform: ConnectorPlatform.Universal,
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_345,
};

const mockConnector3: Connector = {
  id: 'connector_3',
  target: 'connector_3',
  platform: ConnectorPlatform.Universal,
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_456,
};

const mockConnector4: Connector = {
  id: 'connector_4',
  target: 'connector_4',
  platform: ConnectorPlatform.Universal,
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_567,
};

const mockConnector5: Connector = {
  id: 'connector_5',
  target: 'connector_5',
  platform: ConnectorPlatform.Universal,
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_567,
};

const mockConnector6: Connector = {
  id: 'connector_6',
  target: 'connector_6',
  platform: ConnectorPlatform.Universal,
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
    connector: {
      ...mockConnector4,
      platform: null,
    },
    metadata: { ...mockMetadata4, type: ConnectorType.Email, platform: null },
  },
  {
    connector: {
      ...mockConnector5,
      platform: null,
    },
    metadata: { ...mockMetadata5, type: ConnectorType.SMS, platform: null },
  },
  {
    connector: {
      ...mockConnector6,
      platform: null,
    },
    metadata: { ...mockMetadata6, type: ConnectorType.Email, platform: null },
  },
];

export const mockAliyunDmConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'aliyun-dm',
    target: 'aliyun-dm',
    platform: null,
  },
  metadata: {
    ...mockMetadata,
    target: 'aliyun-dm',
    type: ConnectorType.Email,
    platform: null,
  },
};

export const mockAliyunSmsConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'aliyun-sms',
    target: 'aliyun-sms',
    platform: null,
  },
  metadata: {
    ...mockMetadata,
    target: 'aliyun-sms',
    type: ConnectorType.SMS,
    platform: null,
  },
};

export const mockFacebookConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'facebook',
    target: 'facebook',
    platform: ConnectorPlatform.Web,
  },
  metadata: {
    ...mockMetadata,
    target: 'facebook',
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Web,
  },
};

export const mockGithubConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'github',
    target: 'github',
    platform: ConnectorPlatform.Web,
  },
  metadata: {
    ...mockMetadata,
    target: 'github',
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Web,
  },
};

export const mockGoogleConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'google',
    target: 'google',
    platform: ConnectorPlatform.Web,
    enabled: false,
  },
  metadata: {
    ...mockMetadata,
    target: 'google',
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Web,
  },
};
