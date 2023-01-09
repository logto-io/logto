import { InteractionEvent, LogResult } from '@logto/schemas';
import { HookEvent } from '@logto/schemas/lib/models/hooks.js';
import { createMockUtils } from '@logto/shared/esm';
import type { InferModelType } from '@withtyped/server';
import { got } from 'got';

import modelRouters from '#src/model-routers/index.js';
import { MockQueryClient } from '#src/test-utils/query-client.js';

import type { Interaction } from './hook.js';

const { jest } = import.meta;
const { mockEsm, mockEsmDefault } = createMockUtils(jest);

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

const post = jest
  .spyOn(got, 'post')
  // @ts-expect-error for testing
  .mockImplementation(jest.fn(async () => ({ statusCode: 200, body: '{"message":"ok"}' })));

const nanoIdMock = 'mockId';
mockEsm('@logto/core-kit', () => ({
  generateStandardId: () => nanoIdMock,
}));

const { insertLog } = mockEsm('#src/queries/log.js', () => ({
  insertLog: jest.fn(),
}));

mockEsm('#src/queries/user.js', () => ({
  findUserById: () => ({ id: 'user_id', username: 'user', extraField: 'not_ok' }),
}));
mockEsm('#src/queries/application.js', () => ({
  findApplicationById: () => ({ id: 'app_id', extraField: 'not_ok' }),
}));

// eslint-disable-next-line unicorn/consistent-function-scoping
mockEsmDefault('#src/env-set/create-query-client.js', () => () => queryClient);
jest.spyOn(queryClient, 'query').mockImplementation(queryFunction);

const { triggerInteractionHooksIfNeeded } = await import('./hook.js');

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
