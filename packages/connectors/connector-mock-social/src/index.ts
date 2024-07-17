import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import type {
  CreateConnector,
  GetAuthorizationUri,
  GetUserInfo,
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

const getAuthorizationUri: GetAuthorizationUri = async (
  { state, redirectUri, connectorId },
  setSession
) => {
  try {
    await setSession({ state, redirectUri, connectorId });
  } catch (error: unknown) {
    // Ignore the error if the method is not implemented
    if (!(error instanceof ConnectorError && error.code === ConnectorErrorCodes.NotImplemented)) {
      throw error;
    }
  }

  return `http://mock-social/?state=${state}&redirect_uri=${redirectUri}`;
};

const getUserInfo: GetUserInfo = async (data, getSession) => {
  const dataGuard = z.object({
    code: z.string(),
    userId: z.optional(z.string()),
    email: z.string().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    avatar: z.string().optional(),
  });
  const result = dataGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(data));
  }

  try {
    const connectorSession = await getSession();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!connectorSession) {
      throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed);
    }
  } catch (error: unknown) {
    // Ignore the error if the method is not implemented
    if (!(error instanceof ConnectorError && error.code === ConnectorErrorCodes.NotImplemented)) {
      throw error;
    }
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
