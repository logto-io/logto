import { Event } from '@logto/schemas';
import { HookEvent } from '@logto/schemas/lib/models/hooks.js';
import { mockEsm, mockEsmDefault } from '@logto/shared/esm';
import type { InferModelType } from '@withtyped/server';
import { got } from 'got';

import modelRouters from '#src/model-routers/index.js';
import { MockQueryClient } from '#src/test-utils/query-client.js';

import type { Interaction } from './hook.js';

const { jest } = import.meta;

const queryClient = new MockQueryClient();
const queryFunction = jest.fn();

const url = 'https://logto.gg';
const hook: InferModelType<typeof modelRouters.hook.model> = {
  id: 'foo',
  event: HookEvent.PostSignIn,
  config: { headers: { bar: 'baz' }, url, retries: 3 },
  createdAt: new Date(),
};
const readAll = jest
  .spyOn(modelRouters.hook.client, 'readAll')
  .mockResolvedValue({ rows: [hook], rowCount: 1 });

// @ts-expect-error for testing
const post = jest.spyOn(got, 'post').mockImplementation(jest.fn(() => ({ json: jest.fn() })));

mockEsm('#src/queries/user.js', () => ({
  findUserById: () => ({ id: 'user_id', username: 'user', extraField: 'not_ok' }),
}));
mockEsm('#src/queries/application.js', () => ({
  findApplicationById: () => ({ id: 'app_id', extraField: 'not_ok' }),
}));
mockEsm('#src/connectors/index.js', () => ({
  getLogtoConnectorById: () => ({ metadata: { id: 'connector_id', extraField: 'not_ok' } }),
}));
// eslint-disable-next-line unicorn/consistent-function-scoping
mockEsmDefault('#src/env-set/create-query-client-by-env.js', () => () => queryClient);
jest.spyOn(queryClient, 'query').mockImplementation(queryFunction);

const { triggerInteractionHooksIfNeeded } = await import('./hook.js');

describe('triggerInteractionHooksIfNeeded()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return if no user ID found', async () => {
    await triggerInteractionHooksIfNeeded({ event: Event.SignIn });

    expect(queryFunction).not.toBeCalled();
  });

  it('should set correct payload when hook triggered', async () => {
    jest.useFakeTimers().setSystemTime(100_000);

    await triggerInteractionHooksIfNeeded(
      { event: Event.SignIn, identifier: { connectorId: 'bar' } },
      // @ts-expect-error for testing
      {
        jti: 'some_jti',
        result: { login: { accountId: '123' } },
        params: { client_id: 'some_client' },
      } as Interaction
    );

    expect(readAll).toHaveBeenCalled();
    expect(post).toHaveBeenCalledWith(url, {
      headers: { 'user-agent': 'Logto (https://logto.io)', bar: 'baz' },
      json: {
        hookId: 'foo',
        event: 'PostSignIn',
        interactionEvent: 'SignIn',
        sessionId: 'some_jti',
        userId: '123',
        user: { id: 'user_id', username: 'user' },
        application: { id: 'app_id' },
        connectors: [{ id: 'connector_id' }],
        createdAt: new Date(100_000).toISOString(),
      },
      retry: { limit: 3 },
      timeout: { request: 10_000 },
    });
    jest.useRealTimers();
  });
});
