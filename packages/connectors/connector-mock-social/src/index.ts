import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import type {
  GetAuthorizationUri,
  GetUserInfo,
  CreateConnector,
  SocialConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  jsonGuard,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { mockSocialConfigGuard } from './types.js';

const getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
  return `http://mock.social.com/?state=${state}&redirect_uri=${redirectUri}`;
};

const getUserInfo: GetUserInfo = async (data) => {
  const dataGuard = z.object({
    code: z.string(),
    userId: z.optional(z.string()),
    email: z.string().optional(),
    phone: z.string().optional(),
  });
  const result = dataGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(data));
  }

  const { code, userId, ...rest } = result.data;

  // For mock use only. Use to track the created user entity
  return {
    id: userId ?? `mock-social-sub-${randomUUID()}`,
    ...rest,
    rawData: jsonGuard.parse(data),
  };
};

const createMockSocialConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: mockSocialConfigGuard,
    getAuthorizationUri,
    getUserInfo,
  };
};

export default createMockSocialConnector;
