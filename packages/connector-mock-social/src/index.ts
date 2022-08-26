import { randomUUID } from 'crypto';

import {
  ConnectorError,
  ConnectorErrorCodes,
  GetAuthorizationUri,
  GetUserInfo,
  CreateConnector,
  SocialConnector,
} from '@logto/connector-core';
import { z } from 'zod';

import { defaultMetadata } from './constant';
import { mockSocialConfigGuard } from './types';

const getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
  return `http://mock.social.com/?state=${state}&redirect_uri=${redirectUri}`;
};

const getAccessToken = async () => randomUUID();

const getUserInfo: GetUserInfo = async (data) => {
  const dataGuard = z.object({ code: z.string(), userId: z.optional(z.string()) });
  const result = dataGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(data));
  }

  // For mock use only. Use to track the created user entity
  return {
    id: result.data.userId ?? `mock-social-sub-${randomUUID()}`,
  };
};

const createMockSocialConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    configGuard: mockSocialConfigGuard,
    getAuthorizationUri,
    getUserInfo,
  };
};

export default createMockSocialConnector;
