import { JobQueueWorker, type ClaimedJob, type JobQueueQueries } from '@logto/job-queue';
import { InteractionHookEvent, LogResult } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import { type Nullable } from '@silverhand/essentials';
import { HTTPError, TimeoutError, type NormalizedOptions } from 'ky';
import Sinon from 'sinon';

import { type CoreJobSettlementMeta, type WebhookDeliveryHook } from '#src/queries/job-queue.js';

import { type WebhookJobPayload } from './webhook-handler.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const sendWebhookRequest = jest.fn();

await mockEsmWithActual('#src/libraries/hook/utils.js', () => ({
  sendWebhookRequest,
}));

const { EnvSet } = await import('#src/env-set/index.js');
const {
  createWebhookJobHandler,
  parseWebhookJobPayload,
  webhookBodyReadTimeoutMs,
  webhookCircuitBreakerFailureThreshold,
  webhookDeliveryTimeoutMs,
  webhookJobLeaseMs,
  webhookJobType,
  webhookPerHookConcurrency,
  webhookPerTenantConcurrency,
  webhookRetryMaxAgeMs,
  webhookRetryMaxMs,
} = await import('./webhook-handler.js');

const createHookRecord = (overrides?: Partial<WebhookDeliveryHook>): WebhookDeliveryHook => ({
  id: 'hook-1',
  config: { url: 'https://example.com/hook', headers: { 'x-test': '1' }, retries: 3 },
  signingKey: 'live-signing-key',
  enabled: true,
  ...overrides,
});

const createHttpError = (
  status: number,
  options?: { body?: string; headers?: Record<string, string> }
) =>
  new HTTPError(
    new Response(options?.body ?? `status ${status}`, {
      status,
      headers: options?.headers,
    }),
    new Request('https://example.com/hook', { method: 'POST' }),
    {} as NormalizedOptions
  );

const rawPayload = JSON.stringify({
  event: InteractionHookEvent.PostSignIn,
  createdAt: '2026-11-20T00:00:00.000Z',
  hookId: 'hook-1',
  deliveryId: 'delivery-1',
  userId: 'user-1',
});

const createClaimedJob = (
  overrides?: Partial<ClaimedJob<WebhookJobPayload>>
): ClaimedJob<WebhookJobPayload> => ({
  tenantId: 'tenant-1',
  id: 'delivery-1',
  type: webhookJobType,
  groupKey: 'hook-1',
  dedupeKey: 'delivery-1',
  rawPayload,
  payload: parseWebhookJobPayload(rawPayload),
  attempts: 1,
  nextAttemptAt: Date.now() + webhookJobLeaseMs,
  claimedBy: 'worker-1',
  createdAt: Date.now(),
  ...overrides,
});

describe('webhook job handler', () => {
  const findHookForDelivery = jest.fn<
    Promise<Nullable<WebhookDeliveryHook>>,
    [tenantId: string, hookId: string]
  >();

  afterEach(() => {
    Sinon.restore();
    jest.clearAllMocks();
  });

  it('registers the expected lease, retry, circuit breaker, and uniform concurrency limits', () => {
    for (const isCloud of [false, true]) {
      Sinon.stub(EnvSet, 'values').value({ ...EnvSet.values, isCloud });
      const handler = createWebhookJobHandler({ findHookForDelivery });

      expect(handler.type).toBe(webhookJobType);
      expect(handler.leaseMs).toBe(webhookJobLeaseMs);
      expect(webhookDeliveryTimeoutMs).toBeLessThan(webhookJobLeaseMs);
      expect(webhookBodyReadTimeoutMs).toBeLessThanOrEqual(webhookDeliveryTimeoutMs);
      expect(handler.limits).toEqual({
        perTenantConcurrency: webhookPerTenantConcurrency,
        perGroupConcurrency: webhookPerHookConcurrency,
      });
      expect(handler.limits).toEqual({
        perTenantConcurrency: 20,
        perGroupConcurrency: 5,
      });
      expect(handler.circuitBreaker).toEqual({
        failureThreshold: webhookCircuitBreakerFailureThreshold,
      });
      expect(handler.retry.maxAgeMs).toBe(webhookRetryMaxAgeMs);
      expect(handler.retry.backoffMs(1)).toBe(10_000);
      expect(handler.retry.backoffMs(2)).toBe(20_000);
      expect(handler.retry.backoffMs(3)).toBe(40_000);
      expect(handler.retry.backoffMs(12)).toBe(webhookRetryMaxMs);
    }
  });

  it('parses valid webhook payloads while preserving custom keys and rejecting invalid payloads', () => {
    const parsed = parseWebhookJobPayload(rawPayload);
    expect(parsed).toEqual({
      event: InteractionHookEvent.PostSignIn,
      body: {
        event: InteractionHookEvent.PostSignIn,
        createdAt: '2026-11-20T00:00:00.000Z',
        hookId: 'hook-1',
        deliveryId: 'delivery-1',
        userId: 'user-1',
      },
    });

    expect(() => parseWebhookJobPayload('not-json')).toThrow();
    expect(() => parseWebhookJobPayload(JSON.stringify({ event: 'Unknown.Event' }))).toThrow();
  });

  it('reads fresh hook config and signing key at execution time and sends rawPayload with disableRetries', async () => {
    const hook = createHookRecord();
    findHookForDelivery.mockResolvedValueOnce(hook);
    sendWebhookRequest.mockResolvedValueOnce({
      status: 200,
      text: async () => '{"ok":true}',
    });

    const expectedBody: unknown = JSON.parse(rawPayload);
    const handler = createWebhookJobHandler({ findHookForDelivery });
    const result = await handler.handle(createClaimedJob({ attempts: 2 }));

    expect(findHookForDelivery).toHaveBeenCalledWith('tenant-1', 'hook-1');
    expect(sendWebhookRequest).toHaveBeenCalledWith({
      hookConfig: hook.config,
      body: rawPayload,
      signingKey: hook.signingKey,
      signal: expect.any(AbortSignal) as AbortSignal,
      disableRetries: true,
    });
    expect(result.status).toBe('done');
    expect(result.meta?.log?.key).toBe(`TriggerHook.${InteractionHookEvent.PostSignIn}`);
    expect(result.meta?.log?.payload).toMatchObject({
      key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
      result: LogResult.Success,
      hookId: 'hook-1',
      attempts: 2,
      hookRequest: { body: expectedBody },
      response: { statusCode: 200, body: { ok: true } },
    });
  });

  it.each([408, 429, 500, 502, 503, 504])(
    'classifies HTTP %s as retryable and records attempts in log metadata',
    async (status) => {
      findHookForDelivery.mockResolvedValueOnce(createHookRecord());
      sendWebhookRequest.mockRejectedValueOnce(
        createHttpError(status, { body: '{"message":"upstream error"}' })
      );

      const handler = createWebhookJobHandler({ findHookForDelivery });
      const result = await handler.handle(createClaimedJob({ attempts: 3 }));

      expect(result.status).toBe('retry');
      expect(result.meta?.log?.key).toBe(`TriggerHook.${InteractionHookEvent.PostSignIn}`);
      expect(result.meta?.log?.payload).toMatchObject({
        result: LogResult.Error,
        hookId: 'hook-1',
        attempts: 3,
        response: { statusCode: status, body: { message: 'upstream error' } },
      });
      expect(result.meta?.log?.payload.error).toContain(String(status));
    }
  );

  it.each([400, 401, 403, 404, 410, 422])(
    'classifies HTTP %s as terminal failure and records attempts in log metadata',
    async (status) => {
      findHookForDelivery.mockResolvedValueOnce(createHookRecord());
      sendWebhookRequest.mockRejectedValueOnce(
        createHttpError(status, { body: '{"message":"client error"}' })
      );

      const handler = createWebhookJobHandler({ findHookForDelivery });
      const result = await handler.handle(createClaimedJob({ attempts: 1 }));

      expect(result.status).toBe('fail');
      expect(result.meta?.log?.payload).toMatchObject({
        result: LogResult.Error,
        hookId: 'hook-1',
        attempts: 1,
        response: { statusCode: status, body: { message: 'client error' } },
      });
    }
  );

  it('retries network and timeout errors', async () => {
    const handler = createWebhookJobHandler({ findHookForDelivery });

    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    sendWebhookRequest.mockRejectedValueOnce(
      new TypeError('fetch failed', {
        cause: { code: 'ECONNREFUSED' },
      })
    );
    const networkResult = await handler.handle(createClaimedJob({ attempts: 1 }));
    expect(networkResult.status).toBe('retry');
    expect(networkResult.meta?.log?.payload).toMatchObject({
      result: LogResult.Error,
      hookId: 'hook-1',
      attempts: 1,
    });
    expect(networkResult.meta?.log?.payload).not.toHaveProperty('response');

    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    sendWebhookRequest.mockRejectedValueOnce(
      new TimeoutError(new Request('https://example.com/hook'))
    );
    const timeoutResult = await handler.handle(createClaimedJob({ attempts: 2 }));
    expect(timeoutResult.status).toBe('retry');
    expect(timeoutResult.meta?.log?.payload.attempts).toBe(2);
  });

  it('fails terminally without response metadata on invalid-URL errors', async () => {
    const handler = createWebhookJobHandler({ findHookForDelivery });

    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    sendWebhookRequest.mockRejectedValueOnce(new TypeError('Failed to parse URL from bad-url'));

    const result = await handler.handle(createClaimedJob());

    expect(result.status).toBe('fail');
    expect(result.meta?.log?.payload).toMatchObject({
      result: LogResult.Error,
      hookId: 'hook-1',
      attempts: 1,
    });
    expect(result.meta?.log?.payload.error).toContain('Failed to parse URL from bad-url');
    expect(result.meta?.log?.payload).not.toHaveProperty('response');

    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    sendWebhookRequest.mockRejectedValueOnce(
      new TypeError('Invalid URL', {
        cause: { code: 'ERR_INVALID_URL' },
      })
    );
    const causeResult = await handler.handle(createClaimedJob());
    expect(causeResult.status).toBe('fail');
  });

  it.each([429, 503, 408])(
    'honors Retry-After header on HTTP %s between the backoff schedule and 4 hours',
    async (status) => {
      const handler = createWebhookJobHandler({ findHookForDelivery });

      findHookForDelivery.mockResolvedValueOnce(createHookRecord());
      sendWebhookRequest.mockRejectedValueOnce(
        createHttpError(status, { headers: { 'retry-after': '120' } })
      );
      await expect(handler.handle(createClaimedJob())).resolves.toMatchObject({
        status: 'retry',
        retryAfterMs: 120_000,
      });

      findHookForDelivery.mockResolvedValueOnce(createHookRecord());
      sendWebhookRequest.mockRejectedValueOnce(
        createHttpError(status, { headers: { 'retry-after': '86400' } })
      );
      await expect(handler.handle(createClaimedJob())).resolves.toMatchObject({
        status: 'retry',
        retryAfterMs: webhookRetryMaxMs,
      });

      // A delay shorter than the backoff for this attempt (40 s on attempt 3) is raised to it.
      findHookForDelivery.mockResolvedValueOnce(createHookRecord());
      sendWebhookRequest.mockRejectedValueOnce(
        createHttpError(status, { headers: { 'retry-after': '0' } })
      );
      await expect(handler.handle(createClaimedJob({ attempts: 3 }))).resolves.toMatchObject({
        status: 'retry',
        retryAfterMs: 40_000,
      });

      findHookForDelivery.mockResolvedValueOnce(createHookRecord());
      sendWebhookRequest.mockRejectedValueOnce(
        createHttpError(status, { headers: { 'retry-after': 'not-a-delay' } })
      );
      const invalidHeaderResult = await handler.handle(createClaimedJob());
      expect(invalidHeaderResult.status).toBe('retry');
      expect(invalidHeaderResult).not.toHaveProperty('retryAfterMs');
    }
  );

  it('drops pending deliveries without logging when the hook is deleted or disabled', async () => {
    const handler = createWebhookJobHandler({ findHookForDelivery });

    findHookForDelivery.mockResolvedValueOnce(null);
    await expect(handler.handle(createClaimedJob())).resolves.toEqual({ status: 'done' });

    findHookForDelivery.mockResolvedValueOnce(createHookRecord({ enabled: false }));
    await expect(handler.handle(createClaimedJob())).resolves.toEqual({ status: 'done' });

    expect(sendWebhookRequest).not.toHaveBeenCalled();
  });

  it('fails without log metadata when tenantId is absent and propagates unexpected DB errors', async () => {
    const handler = createWebhookJobHandler({ findHookForDelivery });

    await expect(handler.handle(createClaimedJob({ tenantId: undefined }))).resolves.toEqual({
      status: 'fail',
    });
    expect(findHookForDelivery).not.toHaveBeenCalled();

    findHookForDelivery.mockRejectedValueOnce(new Error('connection reset'));
    await expect(handler.handle(createClaimedJob())).rejects.toThrow('connection reset');
  });

  it('settles as delivered when a 2xx response body read exceeds bodyReadTimeoutMs', async () => {
    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    sendWebhookRequest.mockResolvedValueOnce({
      status: 200,
      text: async () =>
        new Promise<string>((resolve) => {
          void resolve;
        }),
    });

    const handler = createWebhookJobHandler({ findHookForDelivery }, { bodyReadTimeoutMs: 50 });
    const result = await handler.handle(createClaimedJob());

    const sentRequest = sendWebhookRequest.mock.calls[0]?.[0] as { signal?: AbortSignal };
    expect(sentRequest.signal?.aborted).toBe(true);
    expect(result.status).toBe('done');
    expect(result.meta?.log?.payload).toMatchObject({
      result: LogResult.Success,
      hookId: 'hook-1',
      attempts: 1,
      response: { statusCode: 200 },
    });
    expect(result.meta?.log?.payload).not.toHaveProperty('error');
  });

  it('exhausts and invokes onExhausted at the 24-hour cutoff', async () => {
    const now = Date.now();
    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    sendWebhookRequest.mockRejectedValueOnce(createHttpError(503));

    const settle = jest.fn<
      ReturnType<JobQueueQueries<CoreJobSettlementMeta>['settle']>,
      Parameters<JobQueueQueries<CoreJobSettlementMeta>['settle']>
    >(async () => 'settled');
    const onExhausted = jest.fn();
    const queries: JobQueueQueries<CoreJobSettlementMeta> = {
      claimDue: jest
        .fn()
        .mockResolvedValueOnce([
          {
            tenantId: 'tenant-1',
            id: 'delivery-1',
            type: webhookJobType,
            groupKey: 'hook-1',
            dedupeKey: 'delivery-1',
            payload: rawPayload,
            attempts: 12,
            nextAttemptAt: now + webhookJobLeaseMs,
            claimedBy: 'worker-1',
            createdAt: now - webhookRetryMaxAgeMs,
          },
        ])
        .mockResolvedValue([]),
      settle,
    };

    const worker = new JobQueueWorker<CoreJobSettlementMeta>(queries, { pollIntervalMs: 5000 });
    worker.register(createWebhookJobHandler({ findHookForDelivery }, { onExhausted }));
    worker.start();

    await new Promise((resolve) => {
      setTimeout(resolve, 30);
    });
    await worker.stop();

    expect(settle).toHaveBeenCalledTimes(1);
    expect(settle.mock.calls[0]?.[0].resolution.status).toBe('exhausted');
    expect(settle.mock.calls[0]?.[0].meta?.log?.payload.nextAttemptAt).toBeUndefined();
    expect(onExhausted).toHaveBeenCalledTimes(1);
  });
});
