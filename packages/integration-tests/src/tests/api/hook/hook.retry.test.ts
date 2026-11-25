/* eslint-disable @silverhand/fp/no-mutation -- mock webhook fixture state is updated per request */
import { LogResult, type LogResponse } from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { getWebhookRecentLogs } from '#src/api/logs.js';
import { createRole, deleteRole } from '#src/api/role.js';
import { isDevFeaturesEnabled } from '#src/constants.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { devFeatureDisabledTest, devFeatureTest, waitFor } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const retryPort = 9980;
const hookName = 'webhookRetryHook';
const hookEvent = 'Role.Created';
const fourHoursMs = 4 * 60 * 60 * 1000;

const state: {
  requestCount: number;
  statusCode: number;
  succeedOnAttempt: number;
  retryAfter: string | undefined;
} = {
  requestCount: 0,
  statusCode: 200,
  succeedOnAttempt: Number.POSITIVE_INFINITY,
  retryAfter: undefined,
};

const pollHookLog = async (
  hookId: string,
  predicate: (log: LogResponse | undefined) => boolean,
  retriesLeft = 150
): Promise<LogResponse | undefined> => {
  const logs = await getWebhookRecentLogs(
    hookId,
    new URLSearchParams({ logKey: `TriggerHook.${hookEvent}`, page_size: '10' })
  );
  const latest = logs[0];

  if (predicate(latest) || retriesLeft <= 1) {
    return latest;
  }

  await waitFor(100);
  return pollHookLog(hookId, predicate, retriesLeft - 1);
};

describe('webhook delivery retries', () => {
  const webHookApi = new WebHookApiTest();
  const webhookServer = new WebhookMockServer(retryPort, (_body, _request, response) => {
    state.requestCount += 1;

    const status = state.requestCount >= state.succeedOnAttempt ? 200 : state.statusCode;

    if (status >= 400) {
      if (state.retryAfter !== undefined) {
        response.setHeader('Retry-After', state.retryAfter);
      }
      response.statusCode = status;
      response.end();
    }
  });

  const triggerRoleCreated = async ({
    description,
    expectedLog,
  }: {
    description: string;
    expectedLog: {
      errorMessage?: string;
      hookPayload?: Record<string, unknown>;
    };
  }) => {
    const hook = webHookApi.hooks.get(hookName)!;
    const role = await createRole({ description });

    try {
      await assertHookLogResult(hook, hookEvent, expectedLog);

      const logs = await getWebhookRecentLogs(
        hook.id,
        new URLSearchParams({ logKey: `TriggerHook.${hookEvent}`, page_size: '10' })
      );

      return { logs };
    } finally {
      await deleteRole(role.id);
    }
  };

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

  devFeatureDisabledTest.it(
    'retries POST 500 responses three times and records a single error log',
    async () => {
      state.statusCode = 500;

      const { logs } = await triggerRoleCreated({
        description: 'webhook-retry-500',
        expectedLog: { errorMessage: '500' },
      });

      expect(state.requestCount).toBe(4);
      expect(logs).toHaveLength(1);
      expect(logs[0]?.payload.result).toBe(LogResult.Error);
    }
  );

  devFeatureDisabledTest.it(
    'stops retrying after a successful attempt and records a single success log',
    async () => {
      state.statusCode = 500;
      state.succeedOnAttempt = 3;

      const { logs } = await triggerRoleCreated({
        description: 'webhook-retry-eventual-success',
        expectedLog: { hookPayload: { event: hookEvent } },
      });

      expect(state.requestCount).toBe(3);
      expect(logs).toHaveLength(1);
    }
  );

  it('does not retry 4xx responses', async () => {
    state.statusCode = 400;

    const { logs } = await triggerRoleCreated({
      description: 'webhook-retry-4xx',
      expectedLog: { errorMessage: '400' },
    });

    expect(state.requestCount).toBe(1);
    if (isDevFeaturesEnabled) {
      expect(logs[0]?.payload.attempts).toBe(1);
      expect(logs[0]?.payload.nextAttemptAt).toBeUndefined();
    }
  });

  devFeatureTest.it(
    'retries 503 and updates the single log entry in place to success with attempts = 2',
    async () => {
      state.statusCode = 503;
      state.retryAfter = '0';
      state.succeedOnAttempt = 2;

      const hook = webHookApi.hooks.get(hookName)!;
      const role = await createRole({ description: 'webhook-queued-retry-503' });

      try {
        const settledLog = await pollHookLog(
          hook.id,
          (log) => log?.payload.result === LogResult.Success
        );
        expect(settledLog?.payload.result).toBe(LogResult.Success);
        expect(settledLog?.payload.attempts).toBe(2);
        expect(settledLog?.payload.nextAttemptAt).toBeUndefined();

        const logs = await getWebhookRecentLogs(
          hook.id,
          new URLSearchParams({ logKey: `TriggerHook.${hookEvent}`, page_size: '10' })
        );
        expect(logs).toHaveLength(1);
        expect(state.requestCount).toBe(2);
      } finally {
        await deleteRole(role.id);
      }
    }
  );

  devFeatureTest.it(
    'schedules a queued retry on 500 without in-call retries and ignores deprecated retries config',
    async () => {
      state.statusCode = 500;
      const hook = webHookApi.hooks.get(hookName)!;
      await authedAdminApi.patch(`hooks/${hook.id}`, {
        json: { config: { url: webhookServer.endpoint, retries: 3 } },
      });

      const startedAt = Date.now();
      const { logs } = await triggerRoleCreated({
        description: 'webhook-queued-retry-500',
        expectedLog: { errorMessage: '500' },
      });

      expect(state.requestCount).toBe(1);
      expect(logs).toHaveLength(1);
      expect(logs[0]?.payload.result).toBe(LogResult.Error);
      expect(logs[0]?.payload.attempts).toBe(1);
      const nextAttemptAt = logs[0]?.payload.nextAttemptAt;
      expect(typeof nextAttemptAt).toBe('number');
      expect(nextAttemptAt).toBeGreaterThan(startedAt + 5000);
      expect(nextAttemptAt).toBeLessThanOrEqual(startedAt + 30_000);
    }
  );

  devFeatureTest.it('retries 429 and caps Retry-After at 4 hours', async () => {
    state.statusCode = 429;
    state.retryAfter = '86400';

    const startedAt = Date.now();
    const { logs } = await triggerRoleCreated({
      description: 'webhook-queued-retry-429',
      expectedLog: { errorMessage: '429' },
    });

    expect(state.requestCount).toBe(1);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.payload.result).toBe(LogResult.Error);
    expect(logs[0]?.payload.attempts).toBe(1);
    const nextAttemptAt = logs[0]?.payload.nextAttemptAt;
    expect(typeof nextAttemptAt).toBe('number');
    expect(nextAttemptAt).toBeGreaterThanOrEqual(startedAt + fourHoursMs - 5000);
    expect(nextAttemptAt).toBeLessThanOrEqual(startedAt + fourHoursMs + 30_000);
  });
});

/* eslint-enable @silverhand/fp/no-mutation */
