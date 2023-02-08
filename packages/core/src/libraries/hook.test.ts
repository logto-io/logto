import { InteractionEvent, LogResult } from '@logto/schemas';
import { HookEvent } from '@logto/schemas/lib/models/hooks.js';
import { createMockUtils } from '@logto/shared/esm';
import type { InferModelType } from '@withtyped/server';
import { got } from 'got';

import type { ModelRouters } from '#src/model-routers/index.js';

import type { Interaction } from './hook.js';

const { jest } = import.meta;
const { mockEsmDefault, mockEsmWithActual } = createMockUtils(jest);

const nanoIdMock = 'mockId';
await mockEsmWithActual('@logto/core-kit', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  buildIdGenerator: () => () => nanoIdMock,
  generateStandardId: () => nanoIdMock,
}));

const { createModelRouters } = await import('#src/model-routers/index.js');
const { MockQueryClient } = await import('#src/test-utils/query-client.js');
const { MockQueries } = await import('#src/test-utils/tenant.js');

const queryClient = new MockQueryClient();
const queryFunction = jest.fn();

const url = 'https://logto.gg';
const hook: InferModelType<ModelRouters['hook']['model']> = {
  tenantId: undefined,
  id: 'foo',
  event: HookEvent.PostSignIn,
  config: { headers: { bar: 'baz' }, url, retries: 3 },
  createdAt: new Date(),
};

const post = jest
  .spyOn(got, 'post')
  // @ts-expect-error for testing
  .mockImplementation(jest.fn(async () => ({ statusCode: 200, body: '{"message":"ok"}' })));

const insertLog = jest.fn();

// eslint-disable-next-line unicorn/consistent-function-scoping
mockEsmDefault('#src/env-set/create-query-client.js', () => () => queryClient);
jest.spyOn(queryClient, 'query').mockImplementation(queryFunction);

const { createHookLibrary } = await import('./hook.js');
const modelRouters = createModelRouters(new MockQueryClient());
const { triggerInteractionHooksIfNeeded } = createHookLibrary(
  new MockQueries({
    // @ts-expect-error
    users: { findUserById: () => ({ id: 'user_id', username: 'user', extraField: 'not_ok' }) },
    applications: {
      // @ts-expect-error
      findApplicationById: async () => ({ id: 'app_id', extraField: 'not_ok' }),
    },
    logs: { insertLog },
  }),
  modelRouters
);

const readAll = jest
  .spyOn(modelRouters.hook.client, 'readAll')
  .mockResolvedValue({ rows: [hook], rowCount: 1 });

describe('triggerInteractionHooksIfNeeded()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return if no user ID found', async () => {
    await triggerInteractionHooksIfNeeded(InteractionEvent.SignIn);

    expect(queryFunction).not.toBeCalled();
  });

  it('should set correct payload when hook triggered', async () => {
    jest.useFakeTimers().setSystemTime(100_000);

    await triggerInteractionHooksIfNeeded(
      InteractionEvent.SignIn,
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
        createdAt: new Date(100_000).toISOString(),
      },
      retry: { limit: 3 },
      timeout: { request: 10_000 },
    });

    const calledPayload: unknown = insertLog.mock.calls[0][0];
    expect(calledPayload).toHaveProperty('id', nanoIdMock);
    expect(calledPayload).toHaveProperty('key', 'TriggerHook.' + HookEvent.PostSignIn);
    expect(calledPayload).toHaveProperty('payload.result', LogResult.Success);
    expect(calledPayload).toHaveProperty('payload.hookId', 'foo');
    expect(calledPayload).toHaveProperty('payload.json.event', HookEvent.PostSignIn);
    expect(calledPayload).toHaveProperty('payload.json.interactionEvent', InteractionEvent.SignIn);
    expect(calledPayload).toHaveProperty('payload.json.hookId', 'foo');
    expect(calledPayload).toHaveProperty('payload.json.userId', '123');
    expect(calledPayload).toHaveProperty('payload.response.statusCode', 200);
    expect(calledPayload).toHaveProperty('payload.response.body.message', 'ok');
    jest.useRealTimers();
  });
});
