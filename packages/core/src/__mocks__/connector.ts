import { ConnectorPlatform } from '@logto/connector-types';
import { Connector, ConnectorMetadata, ConnectorType } from '@logto/schemas';

export const mockMetadata: ConnectorMetadata = {
  id: 'connector',
  type: ConnectorType.Email,
  platform: ConnectorPlatform.General,
  name: {},
  logo: './logo.png',
  description: {},
  readme: 'README.md',
  configTemplate: 'config-template.md',
};

export const mockConnector: Connector = {
  id: 'connector',
  name: 'connector',
  platform: ConnectorPlatform.General,
  type: ConnectorType.Email,
  enabled: true,
  metadata: mockMetadata,
  config: {},
  createdAt: 1_234_567_890_123,
};

const mockMetadata0: ConnectorMetadata = {
  ...mockMetadata,
  id: 'connector_0',
  type: ConnectorType.Email,
  platform: ConnectorPlatform.General,
};

const mockMetadata1: ConnectorMetadata = {
  ...mockMetadata,
  id: 'connector_1',
  type: ConnectorType.SMS,
  platform: ConnectorPlatform.General,
};

const mockMetadata2: ConnectorMetadata = {
  ...mockMetadata,
  id: 'connector_2',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.General,
};

const mockMetadata3: ConnectorMetadata = {
  ...mockMetadata,
  id: 'connector_3',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.General,
};

const mockMetadata4: ConnectorMetadata = {
  ...mockMetadata,
  id: 'connector_4',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.General,
};

const mockMetadata5: ConnectorMetadata = {
  ...mockMetadata,
  id: 'connector_5',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.General,
};

const mockMetadata6: ConnectorMetadata = {
  ...mockMetadata,
  id: 'connector_6',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.General,
};

const mockConnector0: Connector = {
  id: 'connector_0',
  name: 'connector_0',
  platform: ConnectorPlatform.General,
  type: ConnectorType.Email,
  enabled: true,
  metadata: mockMetadata0,
  config: {},
  createdAt: 1_234_567_890_123,
};

const mockConnector1: Connector = {
  id: 'connector_1',
  name: 'connector_1',
  platform: ConnectorPlatform.General,
  type: ConnectorType.SMS,
  enabled: true,
  metadata: mockMetadata1,
  config: {},
  createdAt: 1_234_567_890_234,
};

const mockConnector2: Connector = {
  id: 'connector_2',
  name: 'connector_2',
  platform: ConnectorPlatform.General,
  type: ConnectorType.Social,
  enabled: true,
  metadata: mockMetadata2,
  config: {},
  createdAt: 1_234_567_890_345,
};

const mockConnector3: Connector = {
  id: 'connector_3',
  name: 'connector_3',
  platform: ConnectorPlatform.General,
  type: ConnectorType.Social,
  enabled: true,
  metadata: mockMetadata3,
  config: {},
  createdAt: 1_234_567_890_456,
};

const mockConnector4: Connector = {
  id: 'connector_4',
  name: 'connector_4',
  platform: ConnectorPlatform.General,
  type: ConnectorType.Social,
  enabled: true,
  metadata: mockMetadata4,
  config: {},
  createdAt: 1_234_567_890_567,
};

const mockConnector5: Connector = {
  id: 'connector_5',
  name: 'connector_5',
  platform: ConnectorPlatform.General,
  type: ConnectorType.Social,
  enabled: true,
  metadata: mockMetadata5,
  config: {},
  createdAt: 1_234_567_890_567,
};

const mockConnector6: Connector = {
  id: 'connector_6',
  name: 'connector_6',
  platform: ConnectorPlatform.General,
  type: ConnectorType.Social,
  enabled: true,
  metadata: mockMetadata6,
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
    connector: {
      ...mockConnector0,
      type: ConnectorType.Social,
      metadata: { ...mockConnector0.metadata, type: ConnectorType.Social },
    },
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
      type: ConnectorType.Email,
      platform: ConnectorPlatform.NA,
      metadata: {
        ...mockConnector4.metadata,
        type: ConnectorType.Email,
        platform: ConnectorPlatform.NA,
      },
    },
    metadata: { ...mockMetadata4, type: ConnectorType.Email, platform: ConnectorPlatform.NA },
  },
  {
    connector: {
      ...mockConnector5,
      type: ConnectorType.SMS,
      platform: ConnectorPlatform.NA,
      metadata: {
        ...mockConnector5.metadata,
        type: ConnectorType.SMS,
        platform: ConnectorPlatform.NA,
      },
    },
    metadata: { ...mockMetadata5, type: ConnectorType.SMS, platform: ConnectorPlatform.NA },
  },
  {
    connector: {
      ...mockConnector6,
      type: ConnectorType.Email,
      platform: ConnectorPlatform.NA,
    },
    metadata: { ...mockMetadata6, type: ConnectorType.Email, platform: ConnectorPlatform.NA },
  },
];

export const mockAliyunDmConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'aliyun-dm',
    name: 'aliyun-dm',
    type: ConnectorType.Email,
    metadata: {
      ...mockConnector.metadata,
      id: 'aliyun-dm',
      type: ConnectorType.Email,
    },
  },
  metadata: {
    ...mockConnector.metadata,
    id: 'aliyun-dm',
    type: ConnectorType.Email,
  },
};

export const mockAliyunSmsConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'aliyun-sms',
    name: 'aliyun-sms',
    type: ConnectorType.SMS,
    metadata: {
      ...mockConnector.metadata,
      id: 'aliyun-sms',
      type: ConnectorType.SMS,
    },
  },
  metadata: {
    ...mockConnector.metadata,
    id: 'aliyun-sms',
    type: ConnectorType.SMS,
  },
};

export const mockFacebookConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'facebook',
    name: 'facebook',
    type: ConnectorType.Social,
    metadata: {
      ...mockConnector.metadata,
      id: 'facebook',
      type: ConnectorType.Social,
    },
  },
  metadata: {
    ...mockConnector.metadata,
    id: 'facebook',
    type: ConnectorType.Social,
  },
};

export const mockGithubConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'github',
    name: 'github',
    type: ConnectorType.Social,
    metadata: {
      ...mockConnector.metadata,
      id: 'github',
      type: ConnectorType.Social,
    },
  },
  metadata: {
    ...mockConnector.metadata,
    id: 'github',
    type: ConnectorType.Social,
  },
};

export const mockGoogleConnectorInstance = {
  connector: {
    ...mockConnector,
    id: 'google',
    name: 'google',
    type: ConnectorType.Social,
    enabled: false,
    metadata: {
      ...mockConnector.metadata,
      id: 'google',
      type: ConnectorType.Social,
    },
  },
  metadata: {
    ...mockConnector.metadata,
    id: 'google',
    type: ConnectorType.Social,
  },
};
