import {
  ApplicationType,
  managementApiHooksRegistration,
  type HookConfig,
  type HookEvent,
  type HookEventPayload,
} from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import { type IRouterParamContext } from 'koa-router';
import ky, { type KyResponse } from 'ky';

import { sign } from '#src/utils/sign.js';

export const parseResponse = async (response: KyResponse) => {
  const body = await response.text();
  return {
    statusCode: response.status,
    // eslint-disable-next-line no-restricted-syntax
    body: trySafe(() => JSON.parse(body) as unknown) ?? String(body),
  };
};

type SendWebhookRequest = {
  hookConfig: HookConfig;
  payload: HookEventPayload;
  signingKey: string;
};

export const sendWebhookRequest = async ({
  hookConfig,
  payload,
  signingKey,
}: SendWebhookRequest) => {
  const { url, headers, retries } = hookConfig;

  return ky.post(url, {
    headers: {
      'user-agent': 'Logto (https://logto.io/)',
      ...headers,
      ...conditional(signingKey && { 'logto-signature-sha-256': sign(signingKey, payload) }),
    },
    json: payload,
    retry: { limit: retries ?? 3 },
    timeout: 10_000,
  });
};

export const generateHookTestPayload = (hookId: string, event: HookEvent): HookEventPayload => {
  const fakeUserId = 'fake-user-id';
  const now = new Date();

  return {
    hookId,
    event,
    createdAt: now.toISOString(),
    sessionId: 'fake-session-id',
    userAgent: 'fake-user-agent',
    userId: fakeUserId,
    userIp: 'fake-user-ip',
    user: {
      id: fakeUserId,
      username: 'fake-user',
      primaryEmail: 'fake-user@fake-service.com',
      primaryPhone: '1234567890',
      name: 'Fake User',
      avatar: 'https://fake-service.com/avatars/fake-user.png',
      customData: { theme: 'light' },
      identities: {
        google: {
          userId: 'fake-google-user-id',
        },
      },
      profile: {},
      applicationId: 'fake-application-id',
      isSuspended: false,
      lastSignInAt: now.getTime(),
      createdAt: now.getTime(),
      updatedAt: now.getTime(),
    },
    application: {
      id: 'fake-spa-application-id',
      type: ApplicationType.SPA,
      name: 'Fake Application',
      description: 'Fake application data for testing',
    },
  };
};

export const buildManagementApiDataHookRegistrationKey = (
  method: string,
  route: IRouterParamContext['_matchedRoute']
) => `${method} ${route}`;

export const hasRegisteredDataHookEvent = (
  key: string
): key is keyof typeof managementApiHooksRegistration => key in managementApiHooksRegistration;
