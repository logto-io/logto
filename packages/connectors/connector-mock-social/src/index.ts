import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import type {
  CreateConnector,
  GetAuthorizationUri,
  GetSession,
  GetTokenResponseAndUserInfo,
  GetUserInfo,
  SocialConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  jsonGuard,
  tokenResponseGuard,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { mockSocialConfigGuard } from './types.js';

const mockSocialAuthDomain = 'http://mock-social/';
const defaultScope = 'email profile';

const getAuthorizationUri: GetAuthorizationUri = async (
  { state, redirectUri, connectorId, scope },
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

  const queryParams = new URLSearchParams({
    state,
    redirect_uri: redirectUri,
    scope: scope ?? defaultScope,
  });

  return `${mockSocialAuthDomain}?${queryParams.toString()}`;
};

const validateConnectorSession = async (getSession: GetSession) => {
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
};

const mockSocialDataGuard = z.object({
  code: z.string(),
  userId: z.optional(z.string()),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

const getUserInfo: GetUserInfo = async (data, getSession) => {
  const result = mockSocialDataGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(data));
  }

  await validateConnectorSession(getSession);

  const { code, userId, ...rest } = result.data;

  // For mock use only. Use to track the created user entity
  return {
    id: userId ?? `mock-social-sub-${randomUUID()}`,
    ...rest,
    rawData: jsonGuard.parse(data),
  };
};

const getTokenResponseAndUserInfo: GetTokenResponseAndUserInfo = async (data, getSession) => {
  const result = mockSocialDataGuard
    .extend({
      // Extend the data with the token response
      tokenResponse: tokenResponseGuard.optional(),
    })
    .safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(data));
  }

  await validateConnectorSession(getSession);

  const { code, userId, tokenResponse, ...rest } = result.data;

  // For mock use only. Use to track the created user entity
  return {
    userInfo: {
      id: userId ?? `mock-social-sub-${randomUUID()}`,
      ...rest,
      rawData: jsonGuard.parse(data),
    },
    tokenResponse,
  };
};

const createMockSocialConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: mockSocialConfigGuard,
    getAuthorizationUri,
    getUserInfo,
    getTokenResponseAndUserInfo,
  };
};

export default createMockSocialConnector;
