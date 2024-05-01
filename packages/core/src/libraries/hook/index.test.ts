import type { Hook } from '@logto/schemas';
import { HookEvent, InteractionEvent, LogResult } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';

import { generateHookTestPayload, parseResponse } from './utils.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

await mockIdGenerators();

const mockSignature = 'mockSignature';
mockEsm('#src/utils/sign.js', () => ({
  sign: () => mockSignature,
}));

const { sendWebhookRequest } = mockEsm('./utils.js', () => ({
  sendWebhookRequest: jest
    .fn()
    .mockResolvedValue({ status: 200, text: async () => '{"message":"ok"}' }),
  generateHookTestPayload,
  parseResponse,
}));

const { MockQueries } = await import('#src/test-utils/tenant.js');

const url = 'https://logto.gg';
const hook: Hook = {
  tenantId: 'bar',
  id: 'foo',
  name: 'hook_name',
  event: HookEvent.PostSignIn,
  events: [HookEvent.PostSignIn],
  signingKey: 'signing_key',
  enabled: true,
  config: { headers: { bar: 'baz' }, url, retries: 3 },
  createdAt: Date.now() / 1000,
};

const insertLog = jest.fn();
const mockHookState = { requestCount: 100, successCount: 10 };
const getHookExecutionStatsByHookId = jest.fn().mockResolvedValue(mockHookState);
const findAllHooks = jest.fn().mockResolvedValue([hook]);
const findHookById = jest.fn().mockResolvedValue(hook);

const { createHookLibrary } = await import('./index.js');
const { triggerInteractionHooks, testHook } = createHookLibrary(
  new MockQueries({
    users: {
      findUserById: jest.fn().mockReturnValue({
        id: 'user_id',
        username: 'user',
        extraField: 'not_ok',
      }),
    },
    applications: {
      findApplicationById: jest.fn().mockResolvedValue({ id: 'app_id', extraField: 'not_ok' }),
    },
    logs: { insertLog, getHookExecutionStatsByHookId },
    hooks: { findAllHooks, findHookById },
  })
);

describe('triggerInteractionHooks()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set correct payload when hook triggered', async () => {
    jest.useFakeTimers().setSystemTime(100_000);

    await triggerInteractionHooks(
      new ConsoleLog(),
      { event: InteractionEvent.SignIn, sessionId: 'some_jti', applicationId: 'some_client' },
      { userId: '123' }
    );

    expect(findAllHooks).toHaveBeenCalled();
    expect(sendWebhookRequest).toHaveBeenCalledWith({
      hookConfig: hook.config,
      payload: {
        hookId: 'foo',
        event: 'PostSignIn',
        interactionEvent: 'SignIn',
        sessionId: 'some_jti',
        userId: '123',
        user: { id: 'user_id', username: 'user' },
        application: { id: 'app_id' },
        createdAt: new Date(100_000).toISOString(),
      },
      signingKey: hook.signingKey,
    });

    const calledPayload: unknown = insertLog.mock.calls[0][0];
    expect(calledPayload).toHaveProperty('id', mockId);
    expect(calledPayload).toHaveProperty('key', 'TriggerHook.' + HookEvent.PostSignIn);
    expect(calledPayload).toHaveProperty('payload.result', LogResult.Success);
    expect(calledPayload).toHaveProperty('payload.hookId', 'foo');
    expect(calledPayload).toHaveProperty('payload.hookRequest.body.event', HookEvent.PostSignIn);
    expect(calledPayload).toHaveProperty(
      'payload.hookRequest.body.interactionEvent',
      InteractionEvent.SignIn
    );
    expect(calledPayload).toHaveProperty('payload.hookRequest.body.hookId', 'foo');
    expect(calledPayload).toHaveProperty('payload.hookRequest.body.userId', '123');
    expect(calledPayload).toHaveProperty('payload.response.statusCode', 200);
    expect(calledPayload).toHaveProperty('payload.response.body.message', 'ok');
    jest.useRealTimers();
  });
});

describe('testHook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call sendWebhookRequest with correct values', async () => {
    jest.useFakeTimers().setSystemTime(100_000);

    await testHook(hook.id, [HookEvent.PostSignIn], hook.config);
    const testHookPayload = generateHookTestPayload(hook.id, HookEvent.PostSignIn);
    expect(sendWebhookRequest).toHaveBeenCalledWith({
      hookConfig: hook.config,
      payload: testHookPayload,
      signingKey: hook.signingKey,
    });

    jest.useRealTimers();
  });

  it('should call sendWebhookRequest with correct times if multiple events are provided', async () => {
    await testHook(hook.id, [HookEvent.PostSignIn, HookEvent.PostResetPassword], hook.config);
    expect(sendWebhookRequest).toBeCalledTimes(2);
  });

  it('should throw send test payload failed error if sendWebhookRequest fails', async () => {
    sendWebhookRequest.mockRejectedValueOnce(new Error('test error'));
    await expect(testHook(hook.id, [HookEvent.PostSignIn], hook.config)).rejects.toThrowError(
      new RequestError({
        code: 'hook.send_test_payload_failed',
        message: 'Error: test error',
        status: 422,
      })
    );
  });
});
