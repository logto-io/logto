import {
  ApplicationType,
  InteractionHookEvent,
  managementApiHooksRegistration,
  type HookConfig,
  type HookEvent,
  type HookEventPayload,
  type ManagementApiContext,
} from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import { type Context } from 'koa';
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
  const fakeUserId = 'fake-id';
  const now = new Date();

  const interactionHookContext = {
    sessionId: 'fake-session-id',
    userIp: 'fake-user-ip',
    userId: fakeUserId,
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

  const dataHookContext = {
    path: '/fake-path/:id',
    method: 'POST',
    status: 200,
    params: { id: fakeUserId },
    data: { result: 'success' },
  };

  const isInteractionHookEvent = (event: HookEvent): event is InteractionHookEvent =>
    Object.values<string>(InteractionHookEvent).includes(event);

  const basicPayload = {
    hookId,
    createdAt: now.toISOString(),
    userAgent: 'fake-user-agent',
  };

  if (isInteractionHookEvent(event)) {
    return {
      event,
      ...basicPayload,
      ...interactionHookContext,
    };
  }

  // Data hook test payload
  return {
    event,
    ...basicPayload,
    ...dataHookContext,
  };
};

export const buildManagementApiDataHookRegistrationKey = (
  method: string,
  route: IRouterParamContext['_matchedRoute']
) => `${method} ${route}`;

export const hasRegisteredDataHookEvent = (
  key: string
): key is keyof typeof managementApiHooksRegistration => key in managementApiHooksRegistration;

export const buildManagementApiContext = (
  ctx: IRouterParamContext & Context
): ManagementApiContext => {
  const { path, method, status, _matchedRoute: matchedRoute, params } = ctx;

  return {
    path,
    method,
    status,
    params,
    matchedRoute: matchedRoute && String(matchedRoute),
  };
};

/** Per-array cap. 5000 × ~21-char IDs + JSON overhead ≈ 117KB per array; up to four such arrays per payload. LOG-13492. */
export const MEMBERSHIP_DELTA_CAP = 5000;

const membershipDeltaFields = [
  'addedUserIds',
  'removedUserIds',
  'addedApplicationIds',
  'removedApplicationIds',
] as const;

type MembershipDeltaInput = Partial<
  Record<(typeof membershipDeltaFields)[number], readonly string[]>
>;

/** Caps non-empty arrays at {@link MEMBERSHIP_DELTA_CAP}; empty/absent fields are omitted. */
export const truncateMembershipDelta = (input: MembershipDeltaInput): MembershipDeltaInput => {
  const result: MembershipDeltaInput = {};
  for (const key of membershipDeltaFields) {
    const value = input[key];
    if (!value || value.length === 0) {
      continue;
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation
    result[key] =
      value.length > MEMBERSHIP_DELTA_CAP ? value.slice(0, MEMBERSHIP_DELTA_CAP) : value;
  }
  return result;
};
