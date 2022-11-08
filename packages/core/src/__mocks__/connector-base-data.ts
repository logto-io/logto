import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform } from '@logto/connector-kit';
import type { Connector } from '@logto/schemas';

export const mockMetadata: ConnectorMetadata = {
  id: 'id',
  target: 'connector',
  platform: null,
  name: {
    en: 'Connector',
    'pt-PT': 'Conector',
    'zh-CN': '连接器',
    'tr-TR': 'Connector',
    ko: 'Connector',
  },
  logo: './logo.png',
  logoDark: './logo-dark.png',
  description: {
    en: 'Connector',
    'pt-PT': 'Conector',
    'zh-CN': '连接器',
    'tr-TR': 'Connector',
    ko: 'Connector',
  },
  readme: 'README.md',
  configTemplate: 'config-template.json',
};

export const mockMetadata0: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id0',
  target: 'connector_0',
  platform: ConnectorPlatform.Universal,
};

export const mockMetadata1: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id1',
  target: 'connector_1',
  platform: ConnectorPlatform.Universal,
};

export const mockMetadata2: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id2',
  target: 'connector_2',
  platform: ConnectorPlatform.Universal,
};

export const mockMetadata3: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id3',
  target: 'connector_3',
  platform: ConnectorPlatform.Universal,
};

export const mockMetadata4: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id4',
  target: 'connector_4',
  platform: ConnectorPlatform.Universal,
};

export const mockMetadata5: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id5',
  target: 'connector_5',
  platform: ConnectorPlatform.Universal,
};

export const mockMetadata6: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id6',
  target: 'connector_6',
  platform: ConnectorPlatform.Universal,
};

export const mockConnector0: Connector = {
  id: 'id0',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_123,
};

export const mockConnector1: Connector = {
  id: 'id1',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_234,
};

export const mockConnector2: Connector = {
  id: 'id2',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_345,
};

export const mockConnector3: Connector = {
  id: 'id3',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_456,
};

export const mockConnector4: Connector = {
  id: 'id4',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_567,
};

export const mockConnector5: Connector = {
  id: 'id5',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_567,
};

export const mockConnector6: Connector = {
  id: 'id6',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_567,
};
