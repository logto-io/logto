import { ConnectorPlatform } from '@logto/connector-kit';
import type { Connector, ConnectorMetadata } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { any } from 'zod';

import type { LogtoConnector } from '@/connectors/types';

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

export const mockConnector: Connector = {
  id: 'id',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_123,
};

export const mockLogtoConnector = {
  getAuthorizationUri: jest.fn(),
  getUserInfo: jest.fn(),
  sendMessage: jest.fn(),
  validateConfig: jest.fn(),
  configGuard: any(),
};

const mockMetadata0: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id0',
  target: 'connector_0',
  platform: ConnectorPlatform.Universal,
};

const mockMetadata1: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id1',
  target: 'connector_1',
  platform: ConnectorPlatform.Universal,
};

const mockMetadata2: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id2',
  target: 'connector_2',
  platform: ConnectorPlatform.Universal,
};

const mockMetadata3: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id3',
  target: 'connector_3',
  platform: ConnectorPlatform.Universal,
};

const mockMetadata4: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id4',
  target: 'connector_4',
  platform: ConnectorPlatform.Universal,
};

const mockMetadata5: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id5',
  target: 'connector_5',
  platform: ConnectorPlatform.Universal,
};

const mockMetadata6: ConnectorMetadata = {
  ...mockMetadata,
  id: 'id6',
  target: 'connector_6',
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

export const mockLogtoConnectorList: LogtoConnector[] = [
  {
    dbEntry: mockConnector0,
    metadata: { ...mockMetadata0 },
    type: ConnectorType.Social,
    ...mockLogtoConnector,
  },
  {
    dbEntry: mockConnector1,
    metadata: mockMetadata1,
    type: ConnectorType.Sms,
    ...mockLogtoConnector,
  },
  {
    dbEntry: mockConnector2,
    metadata: mockMetadata2,
    type: ConnectorType.Social,
    ...mockLogtoConnector,
  },
  {
    dbEntry: mockConnector3,
    metadata: mockMetadata3,
    type: ConnectorType.Social,
    ...mockLogtoConnector,
  },
  {
    dbEntry: mockConnector4,
    metadata: { ...mockMetadata4, platform: null },
    type: ConnectorType.Email,
    ...mockLogtoConnector,
  },
  {
    dbEntry: mockConnector5,
    metadata: { ...mockMetadata5, platform: null },
    type: ConnectorType.Sms,
    ...mockLogtoConnector,
  },
  {
    dbEntry: mockConnector6,
    metadata: { ...mockMetadata6, platform: null },
    type: ConnectorType.Email,
    ...mockLogtoConnector,
  },
];

export const mockAliyunDmConnector: LogtoConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'aliyun-dm',
  },
  metadata: {
    ...mockMetadata,
    id: 'aliyun-dm',
    target: 'aliyun-dm',
    platform: null,
  },
  type: ConnectorType.Email,
  ...mockLogtoConnector,
};

export const mockAliyunSmsConnector: LogtoConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'aliyun-sms',
  },
  metadata: {
    ...mockMetadata,
    id: 'aliyun-sms',
    target: 'aliyun-sms',
    platform: null,
  },
  type: ConnectorType.Sms,
  ...mockLogtoConnector,
};

export const mockFacebookConnector: LogtoConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'facebook',
  },
  metadata: {
    ...mockMetadata,
    id: 'facebook',
    target: 'facebook',
    platform: ConnectorPlatform.Web,
  },
  type: ConnectorType.Social,
  ...mockLogtoConnector,
};

export const mockGithubConnector: LogtoConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'github',
  },
  metadata: {
    ...mockMetadata,
    id: 'github',
    target: 'github',
    platform: ConnectorPlatform.Web,
  },
  type: ConnectorType.Social,
  ...mockLogtoConnector,
};

export const mockWechatConnector: LogtoConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'wechat-web',
  },
  metadata: {
    ...mockMetadata,
    id: 'wechat-web',
    target: 'wechat',
    platform: ConnectorPlatform.Web,
  },
  type: ConnectorType.Social,
  ...mockLogtoConnector,
};

export const mockWechatNativeConnector: LogtoConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'wechat-native',
  },
  metadata: {
    ...mockMetadata,
    id: 'wechat-native',
    target: 'wechat',
    platform: ConnectorPlatform.Native,
  },
  type: ConnectorType.Social,
  ...mockLogtoConnector,
};

export const mockGoogleConnector: LogtoConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'google',
    enabled: false,
  },
  metadata: {
    ...mockMetadata,
    id: 'google',
    target: 'google',
    platform: ConnectorPlatform.Web,
  },
  type: ConnectorType.Social,
  ...mockLogtoConnector,
};

export const mockLogtoConnectors = [
  mockAliyunDmConnector,
  mockAliyunSmsConnector,
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockWechatConnector,
  mockWechatNativeConnector,
];
