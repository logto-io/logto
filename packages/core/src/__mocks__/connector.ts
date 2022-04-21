import { ConnectorMetadata } from '@logto/connector-types';
import { Connector, ConnectorType } from '@logto/schemas';

export const mockConnectorList: Connector[] = [
  {
    id: 'connector_0',
    type: ConnectorType.Email,
    enabled: true,
    config: {},
    createdAt: 1_234_567_890_123,
  },
  {
    id: 'connector_1',
    type: ConnectorType.SMS,
    enabled: true,
    config: {},
    createdAt: 1_234_567_890_234,
  },
  {
    id: 'connector_2',
    type: ConnectorType.Social,
    enabled: true,
    config: {},
    createdAt: 1_234_567_890_345,
  },
  {
    id: 'connector_3',
    type: ConnectorType.Social,
    enabled: true,
    config: {},
    createdAt: 1_234_567_890_456,
  },
  {
    id: 'connector_4',
    type: ConnectorType.Social,
    enabled: true,
    config: {},
    createdAt: 1_234_567_890_567,
  },
  {
    id: 'connector_5',
    type: ConnectorType.Social,
    enabled: true,
    config: {},
    createdAt: 1_234_567_890_567,
  },
  {
    id: 'connector_6',
    type: ConnectorType.Social,
    enabled: true,
    config: {},
    createdAt: 1_234_567_890_567,
  },
];

export const mockConnectorInstanceList: Array<{
  connector: Connector;
  metadata: ConnectorMetadata;
}> = [
  {
    connector: {
      id: 'connector_0',
      type: ConnectorType.Social,
      enabled: true,
      config: {},
      createdAt: 1_234_567_890_123,
    },
    metadata: {
      id: 'connector_0',
      type: ConnectorType.Social,
      name: {},
      logo: './logo.png',
      description: {},
      readme: 'README.md',
      configTemplate: 'config-template.md',
    },
  },
  {
    connector: {
      id: 'connector_1',
      type: ConnectorType.SMS,
      enabled: true,
      config: {},
      createdAt: 1_234_567_890_234,
    },
    metadata: {
      id: 'connector_1',
      type: ConnectorType.SMS,
      name: {},
      logo: './logo.png',
      description: {},
      readme: 'README.md',
      configTemplate: 'config-template.md',
    },
  },
  {
    connector: {
      id: 'connector_2',
      type: ConnectorType.Social,
      enabled: true,
      config: {},
      createdAt: 1_234_567_890_345,
    },
    metadata: {
      id: 'connector_2',
      type: ConnectorType.Social,
      name: {},
      logo: './logo.png',
      description: {},
      readme: 'README.md',
      configTemplate: 'config-template.md',
    },
  },
  {
    connector: {
      id: 'connector_3',
      type: ConnectorType.Social,
      enabled: true,
      config: {},
      createdAt: 1_234_567_890_456,
    },
    metadata: {
      id: 'connector_3',
      type: ConnectorType.Social,
      name: {},
      logo: './logo.png',
      description: {},
      readme: 'README.md',
      configTemplate: 'config-template.md',
    },
  },
  {
    connector: {
      id: 'connector_4',
      type: ConnectorType.Email,
      enabled: true,
      config: {},
      createdAt: 1_234_567_890_567,
    },
    metadata: {
      id: 'connector_4',
      type: ConnectorType.Email,
      name: {},
      logo: './logo.png',
      description: {},
      readme: 'README.md',
      configTemplate: 'config-template.md',
    },
  },
  {
    connector: {
      id: 'connector_5',
      type: ConnectorType.SMS,
      enabled: true,
      config: {},
      createdAt: 1_234_567_890_567,
    },
    metadata: {
      id: 'connector_5',
      type: ConnectorType.SMS,
      name: {},
      logo: './logo.png',
      description: {},
      readme: 'README.md',
      configTemplate: 'config-template.md',
    },
  },
  {
    connector: {
      id: 'connector_6',
      type: ConnectorType.Email,
      enabled: true,
      config: {},
      createdAt: 1_234_567_890_567,
    },
    metadata: {
      id: 'connector_6',
      type: ConnectorType.Email,
      name: {},
      logo: './logo.png',
      description: {},
      readme: 'README.md',
      configTemplate: 'config-template.md',
    },
  },
];

export const mockAliyunDmConnectorInstance = {
  connector: {
    id: 'aliyun-dm',
    enabled: true,
    config: {},
    createdAt: 1_646_382_233_333,
  },
  metadata: {
    type: ConnectorType.Email,
  },
};

export const mockAliyunSmsConnectorInstance = {
  connector: {
    id: 'aliyun-sms',
    enabled: true,
    config: {},
    createdAt: 1_646_382_233_333,
  },
  metadata: {
    type: ConnectorType.SMS,
  },
};

export const mockFacebookConnectorInstance = {
  connector: {
    id: 'facebook',
    enabled: true,
    config: {},
    createdAt: 1_646_382_233_333,
  },
  metadata: {
    type: ConnectorType.Social,
  },
};

export const mockGithubConnectorInstance = {
  connector: {
    id: 'github',
    enabled: true,
    config: {},
    createdAt: 1_646_382_233_000,
  },
  metadata: {
    type: ConnectorType.Social,
  },
};

export const mockGoogleConnectorInstance = {
  connector: {
    id: 'google',
    enabled: false,
    config: {},
    createdAt: 1_646_382_233_000,
  },
  metadata: {
    type: ConnectorType.Social,
  },
};
