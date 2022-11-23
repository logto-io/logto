import { ConnectorPlatform } from '@logto/connector-kit';
import type { Connector } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { any } from 'zod';

import type { LogtoConnector, VirtualConnectorFactory } from '#src/connectors/types.js';

import {
  mockConnector0,
  mockConnector1,
  mockConnector2,
  mockConnector3,
  mockConnector4,
  mockConnector5,
  mockConnector6,
  mockMetadata,
  mockMetadata0,
  mockMetadata1,
  mockMetadata2,
  mockMetadata3,
  mockMetadata4,
  mockMetadata5,
  mockMetadata6,
} from './connector-base-data.js';

export { mockMetadata } from './connector-base-data.js';

export const mockConnector: Connector = {
  id: 'id',
  enabled: true,
  config: {},
  createdAt: 1_234_567_890_123,
  syncProfile: false,
  metadata: {},
  connectorId: 'id',
};

export const mockLogtoConnector = {
  getAuthorizationUri: jest.fn(),
  getUserInfo: jest.fn(),
  sendMessage: jest.fn(),
  validateConfig: jest.fn(),
  configGuard: any(),
};

export const mockVirtualConnectorFactory: VirtualConnectorFactory = {
  metadata: mockMetadata,
  type: ConnectorType.Social,
  path: 'random_path',
  createConnector: jest.fn(),
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

export const disabledSocialTarget01 = 'disableSocialTarget-id01';
export const disabledSocialTarget02 = 'disableSocialTarget-id02';
export const enabledSocialTarget01 = 'enabledSocialTarget-id01';

export const mockSocialConnectors: LogtoConnector[] = [
  {
    dbEntry: {
      id: 'id0',
      enabled: false,
      config: {},
      createdAt: 1_234_567_890_123,
      syncProfile: false,
      metadata: {},
      connectorId: 'id0',
    },
    metadata: {
      ...mockMetadata,
      target: disabledSocialTarget01,
    },
    type: ConnectorType.Social,
    ...mockLogtoConnector,
  },
  {
    dbEntry: {
      id: 'id1',
      enabled: true,
      config: {},
      createdAt: 1_234_567_890_123,
      syncProfile: false,
      metadata: {},
      connectorId: 'id1',
    },
    metadata: {
      ...mockMetadata,
      target: enabledSocialTarget01,
    },
    type: ConnectorType.Social,
    ...mockLogtoConnector,
  },
  {
    dbEntry: {
      id: 'id2',
      enabled: false,
      config: {},
      createdAt: 1_234_567_890_123,
      syncProfile: false,
      metadata: {},
      connectorId: 'id2',
    },
    metadata: {
      ...mockMetadata,
      target: disabledSocialTarget02,
    },
    type: ConnectorType.Social,
    ...mockLogtoConnector,
  },
];
