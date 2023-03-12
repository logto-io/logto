import type { Hook } from '@logto/schemas';
import { HookEvent, InteractionEvent, LogResult } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import { got } from 'got';

import type { Interaction } from './hook.js';

const { jest } = import.meta;
const { mockEsmDefault, mockEsmWithActual } = createMockUtils(jest);

const nanoIdMock = 'mockId';
await mockEsmWithActual('@logto/core-kit', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  buildIdGenerator: () => () => nanoIdMock,
  generateStandardId: () => nanoIdMock,
}));

const { MockQueries } = await import('#src/test-utils/tenant.js');

const url = 'https://logto.gg';
const hook: Hook = {
  tenantId: 'bar',
  id: 'foo',
  event: HookEvent.PostSignIn,
  config: { headers: { bar: 'baz' }, url, retries: 3 },
  createdAt: Date.now() / 1000,
};

const post = jest
  .spyOn(got, 'post')
  // @ts-expect-error
  .mockImplementation(jest.fn(async () => ({ statusCode: 200, body: '{"message":"ok"}' })));

const insertLog = jest.fn();
const findAllHooks = jest.fn().mockResolvedValue([hook]);

const { createHookLibrary } = await import('./hook.js');
const { triggerInteractionHooksIfNeeded } = createHookLibrary(
  new MockQueries({
    // @ts-expect-error
    users: { findUserById: () => ({ id: 'user_id', username: 'user', extraField: 'not_ok' }) },
    applications: {
      // @ts-expect-error
      findApplicationById: async () => ({ id: 'app_id', extraField: 'not_ok' }),
    },
    logs: { insertLog },
    hooks: { findAllHooks },
  })
);

describe('triggerInteractionHooksIfNeeded()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return if no user ID found', async () => {
    await triggerInteractionHooksIfNeeded(InteractionEvent.SignIn);

    expect(findAllHooks).not.toBeCalled();
  });

  it('should set correct payload when hook triggered', async () => {
    jest.useFakeTimers().setSystemTime(100_000);

    await triggerInteractionHooksIfNeeded(
      InteractionEvent.SignIn,
      // @ts-expect-error
      {
        jti: 'some_jti',
        result: { login: { accountId: '123' } },
        params: { client_id: 'some_client' },
      } as Interaction
    );

    expect(findAllHooks).toHaveBeenCalled();
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
