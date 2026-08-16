/* eslint-disable @silverhand/fp/no-mutation -- mock webhook fixture state is updated per request */
import { LogResult } from '@logto/schemas';

import { getWebhookRecentLogs } from '#src/api/logs.js';
import { createRole, deleteRole } from '#src/api/role.js';
import { WebHookApiTest } from '#src/helpers/hook.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const retryPort = 9980;
const hookName = 'webhookRetryHook';
const hookEvent = 'Role.Created';

const state = {
  requestCount: 0,
  statusCode: 200,
  succeedOnAttempt: Number.POSITIVE_INFINITY,
  retryAfter: undefined as string | undefined,
};

describe('webhook delivery retries', () => {
  const webHookApi = new WebHookApiTest();
  const webhookServer = new WebhookMockServer(retryPort, (_body, _request, response) => {
    state.requestCount += 1;

    const status = state.requestCount >= state.succeedOnAttempt ? 200 : state.statusCode;

    if (status >= 400) {
      response.statusCode = status;

      if (state.retryAfter !== undefined) {
        response.setHeader('Retry-After', state.retryAfter);
      }

      response.end();
    }
  });

  beforeAll(async () => {
    await webhookServer.listen();
  });

  afterAll(async () => {
    await webhookServer.close();
  });

  beforeEach(async () => {
    state.requestCount = 0;
    state.statusCode = 200;
    state.succeedOnAttempt = Number.POSITIVE_INFINITY;
    state.retryAfter = undefined;

    await webHookApi.create({
      name: hookName,
      events: [hookEvent],
      config: { url: webhookServer.endpoint },
    });
  });

  afterEach(async () => {
    await webHookApi.cleanUp();
  });

  it.each([500, 501, 599])(
    'retries POST %s responses three times and records a single error log',
    async (statusCode) => {
      state.statusCode = statusCode;

      const hook = webHookApi.hooks.get(hookName)!;
      const role = await createRole({ description: `webhook-retry-${statusCode}` });

      await assertHookLogResult(hook, hookEvent, {
        errorMessage: String(statusCode),
      });

      const logs = await getWebhookRecentLogs(
        hook.id,
        new URLSearchParams({ logKey: `TriggerHook.${hookEvent}`, page_size: '10' })
      );

      expect(state.requestCount).toBe(4);
      expect(logs.filter(({ payload }) => payload.hookId === hook.id)).toHaveLength(1);
      expect(logs[0]?.payload.result).toBe(LogResult.Error);

      await deleteRole(role.id);
    },
    20_000
  );

  it('stops retrying after a successful attempt and records a single success log', async () => {
    state.statusCode = 500;
    state.succeedOnAttempt = 3;

    const hook = webHookApi.hooks.get(hookName)!;
    const role = await createRole({ description: 'webhook-retry-eventual-success' });

    await assertHookLogResult(hook, hookEvent, {
      hookPayload: { event: hookEvent },
    });

    const logs = await getWebhookRecentLogs(
      hook.id,
      new URLSearchParams({ logKey: `TriggerHook.${hookEvent}`, page_size: '10' })
    );

    expect(state.requestCount).toBe(3);
    expect(logs.filter(({ payload }) => payload.hookId === hook.id)).toHaveLength(1);

    await deleteRole(role.id);
  }, 20_000);

  it('does not retry 4xx responses', async () => {
    state.statusCode = 400;

    const hook = webHookApi.hooks.get(hookName)!;
    const role = await createRole({ description: 'webhook-retry-4xx' });

    await assertHookLogResult(hook, hookEvent, {
      errorMessage: '400',
    });

    expect(state.requestCount).toBe(1);

    await deleteRole(role.id);
  });

  it.each(['0', '86400'])(
    'retries POST 503 with Retry-After %s three times and records a single error log',
    async (retryAfter) => {
      state.statusCode = 503;
      state.retryAfter = retryAfter;

      const hook = webHookApi.hooks.get(hookName)!;
      const startedAt = Date.now();
      const role = await createRole({ description: `webhook-retry-after-${retryAfter}` });

      await assertHookLogResult(hook, hookEvent, {
        errorMessage: '503',
      });

      const logs = await getWebhookRecentLogs(
        hook.id,
        new URLSearchParams({ logKey: `TriggerHook.${hookEvent}`, page_size: '10' })
      );

      expect(state.requestCount).toBe(4);
      expect(logs.filter(({ payload }) => payload.hookId === hook.id)).toHaveLength(1);
      expect(logs[0]?.payload.result).toBe(LogResult.Error);
      expect(Date.now() - startedAt).toBeLessThan(10_000);

      await deleteRole(role.id);
    },
    20_000
  );
});

/* eslint-enable @silverhand/fp/no-mutation */
