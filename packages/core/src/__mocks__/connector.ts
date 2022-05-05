/* eslint-disable max-lines */
import { ConnectorPlatform } from '@logto/connector-types';
import { Connector, ConnectorMetadata, ConnectorType } from '@logto/schemas';

export const mockMetadata: ConnectorMetadata = {
  id: 'connector',
  type: ConnectorType.Email,
  platform: ConnectorPlatform.NA,
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
  metadata: {
    ...mockMetadata,
    id: 'connector',
    platform: ConnectorPlatform.General,
    type: ConnectorType.Email,
  },
  config: {},
  createdAt: 1_234_567_890_123,
};

export const mockConnectorList: Connector[] = [
  {
    id: 'connector_0',
    name: 'connector_0',
    platform: ConnectorPlatform.General,
    type: ConnectorType.Email,
    enabled: true,
    metadata: {
      ...mockMetadata,
      id: 'connector_0',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Email,
    },
    config: {},
    createdAt: 1_234_567_890_123,
  },
  {
    id: 'connector_1',
    name: 'connector_1',
    platform: ConnectorPlatform.General,
    type: ConnectorType.SMS,
    enabled: true,
    metadata: {
      ...mockMetadata,
      id: 'connector_1',
      platform: ConnectorPlatform.General,
      type: ConnectorType.SMS,
    },
    config: {},
    createdAt: 1_234_567_890_234,
  },
  {
    id: 'connector_2',
    name: 'connector_2',
    platform: ConnectorPlatform.General,
    type: ConnectorType.Social,
    enabled: true,
    metadata: {
      ...mockMetadata,
      id: 'connector_2',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Social,
    },
    config: {},
    createdAt: 1_234_567_890_345,
  },
  {
    id: 'connector_3',
    name: 'connector_3',
    platform: ConnectorPlatform.General,
    type: ConnectorType.Social,
    enabled: true,
    metadata: {
      ...mockMetadata,
      id: 'connector_3',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Social,
    },
    config: {},
    createdAt: 1_234_567_890_456,
  },
  {
    id: 'connector_4',
    name: 'connector_4',
    platform: ConnectorPlatform.General,
    type: ConnectorType.Social,
    enabled: true,
    metadata: {
      ...mockMetadata,
      id: 'connector_4',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Social,
    },
    config: {},
    createdAt: 1_234_567_890_567,
  },
  {
    id: 'connector_5',
    name: 'connector_5',
    platform: ConnectorPlatform.General,
    type: ConnectorType.Social,
    enabled: true,
    metadata: {
      ...mockMetadata,
      id: 'connector_5',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Social,
    },
    config: {},
    createdAt: 1_234_567_890_567,
  },
  {
    id: 'connector_6',
    name: 'connector_6',
    platform: ConnectorPlatform.General,
    type: ConnectorType.Social,
    enabled: true,
    metadata: {
      ...mockMetadata,
      id: 'connector_6',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Social,
    },
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
      name: 'connector_0',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Social,
      enabled: true,
      metadata: {
        id: 'connector_0',
        type: ConnectorType.Social,
        platform: ConnectorPlatform.General,
        name: {},
        logo: './logo.png',
        description: {},
        readme: 'README.md',
        configTemplate: 'config-template.md',
      },
      config: {},
      createdAt: 1_234_567_890_123,
    },
    metadata: {
      id: 'connector_0',
      type: ConnectorType.Social,
      platform: ConnectorPlatform.General,
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
      name: 'connector_1',
      platform: ConnectorPlatform.General,
      type: ConnectorType.SMS,
      enabled: true,
      metadata: {
        id: 'connector_1',
        type: ConnectorType.SMS,
        platform: ConnectorPlatform.General,
        name: {},
        logo: './logo.png',
        description: {},
        readme: 'README.md',
        configTemplate: 'config-template.md',
      },
      config: {},
      createdAt: 1_234_567_890_234,
    },
    metadata: {
      id: 'connector_1',
      type: ConnectorType.SMS,
      platform: ConnectorPlatform.General,
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
      name: 'connector_2',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Social,
      enabled: true,
      metadata: {
        id: 'connector_2',
        type: ConnectorType.Social,
        platform: ConnectorPlatform.General,
        name: {},
        logo: './logo.png',
        description: {},
        readme: 'README.md',
        configTemplate: 'config-template.md',
      },
      config: {},
      createdAt: 1_234_567_890_345,
    },
    metadata: {
      id: 'connector_2',
      type: ConnectorType.Social,
      platform: ConnectorPlatform.General,
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
      name: 'connector_3',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Social,
      enabled: true,
      metadata: {
        id: 'connector_3',
        type: ConnectorType.Social,
        platform: ConnectorPlatform.General,
        name: {},
        logo: './logo.png',
        description: {},
        readme: 'README.md',
        configTemplate: 'config-template.md',
      },
      config: {},
      createdAt: 1_234_567_890_456,
    },
    metadata: {
      id: 'connector_3',
      type: ConnectorType.Social,
      platform: ConnectorPlatform.General,
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
      name: 'connector_4',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Email,
      enabled: true,
      metadata: {
        id: 'connector_4',
        type: ConnectorType.Email,
        platform: ConnectorPlatform.General,
        name: {},
        logo: './logo.png',
        description: {},
        readme: 'README.md',
        configTemplate: 'config-template.md',
      },
      config: {},
      createdAt: 1_234_567_890_567,
    },
    metadata: {
      id: 'connector_4',
      type: ConnectorType.Email,
      platform: ConnectorPlatform.General,
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
      name: 'connector_5',
      platform: ConnectorPlatform.General,
      type: ConnectorType.SMS,
      enabled: true,
      metadata: {
        id: 'connector_5',
        type: ConnectorType.SMS,
        platform: ConnectorPlatform.General,
        name: {},
        logo: './logo.png',
        description: {},
        readme: 'README.md',
        configTemplate: 'config-template.md',
      },
      config: {},
      createdAt: 1_234_567_890_567,
    },
    metadata: {
      id: 'connector_5',
      type: ConnectorType.SMS,
      platform: ConnectorPlatform.General,
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
      name: 'connector_6',
      platform: ConnectorPlatform.General,
      type: ConnectorType.Email,
      enabled: true,
      metadata: {
        id: 'connector_6',
        type: ConnectorType.Email,
        platform: ConnectorPlatform.General,
        name: {},
        logo: './logo.png',
        description: {},
        readme: 'README.md',
        configTemplate: 'config-template.md',
      },
      config: {},
      createdAt: 1_234_567_890_567,
    },
    metadata: {
      id: 'connector_6',
      type: ConnectorType.Email,
      platform: ConnectorPlatform.General,
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
    name: 'connector',
    platform: ConnectorPlatform.General,
    enabled: true,
    metadata: {
      type: ConnectorType.Email,
    },
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
    name: 'connector',
    platform: ConnectorPlatform.General,
    enabled: true,
    metadata: {
      type: ConnectorType.SMS,
    },
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
    name: 'connector',
    platform: ConnectorPlatform.General,
    enabled: true,
    metadata: {
      type: ConnectorType.Social,
    },
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
    name: 'connector',
    platform: ConnectorPlatform.General,
    enabled: true,
    metadata: {
      type: ConnectorType.Social,
    },
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
    name: 'connector',
    platform: ConnectorPlatform.General,
    enabled: false,
    metadata: {
      type: ConnectorType.Social,
    },
    config: {},
    createdAt: 1_646_382_233_000,
  },
  metadata: {
    type: ConnectorType.Social,
  },
};
/* eslint-enable max-lines */
