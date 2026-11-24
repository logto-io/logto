import { type ClaimedJob } from '@logto/job-queue';
import { InteractionHookEvent, LogResult } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import { type Nullable } from '@silverhand/essentials';
import { HTTPError, type NormalizedOptions } from 'ky';

import { type WebhookDeliveryHook } from '#src/queries/job-queue.js';

import { type WebhookJobPayload } from './webhook-handler.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const sendWebhookRequest = jest.fn();

await mockEsmWithActual('#src/libraries/hook/utils.js', () => ({
  sendWebhookRequest,
}));

const {
  createWebhookJobHandler,
  parseWebhookJobPayload,
  webhookDeliveryTimeoutMs,
  webhookJobLeaseMs,
  webhookJobType,
} = await import('./webhook-handler.js');

const createHookRecord = (overrides?: Partial<WebhookDeliveryHook>): WebhookDeliveryHook => ({
  id: 'hook-1',
  config: { url: 'https://example.com/hook', headers: { 'x-test': '1' } },
  signingKey: 'live-signing-key',
  enabled: true,
  ...overrides,
});

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
    jest.clearAllMocks();
  });

  it('registers the expected lease and concurrency limits', () => {
    const handler = createWebhookJobHandler({ findHookForDelivery });

    expect(handler.type).toBe(webhookJobType);
    expect(handler.leaseMs).toBe(webhookJobLeaseMs);
    expect(webhookDeliveryTimeoutMs).toBeLessThan(webhookJobLeaseMs);
    expect(handler.limits).toEqual({
      perTenantConcurrency: 20,
      perGroupConcurrency: 5,
    });
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

  it('reads fresh hook config and signing key at execution time and sends rawPayload', async () => {
    const hook = createHookRecord();
    findHookForDelivery.mockResolvedValueOnce(hook);
    sendWebhookRequest.mockResolvedValueOnce({
      status: 200,
      text: async () => '{"ok":true}',
    });

    const expectedBody: unknown = JSON.parse(rawPayload);
    const handler = createWebhookJobHandler({ findHookForDelivery });
    const result = await handler.handle(createClaimedJob());

    expect(findHookForDelivery).toHaveBeenCalledWith('tenant-1', 'hook-1');
    expect(sendWebhookRequest).toHaveBeenCalledWith({
      hookConfig: hook.config,
      body: rawPayload,
      signingKey: hook.signingKey,
      signal: expect.any(AbortSignal) as AbortSignal,
    });
    expect(result.status).toBe('done');
    expect(result.meta?.log?.key).toBe(`TriggerHook.${InteractionHookEvent.PostSignIn}`);
    expect(result.meta?.log?.payload).toMatchObject({
      key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
      result: LogResult.Success,
      hookId: 'hook-1',
      hookRequest: { body: expectedBody },
      response: { statusCode: 200, body: { ok: true } },
    });
  });

  it('records HTTP error responses in settlement log metadata and returns fail', async () => {
    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    const httpError = new HTTPError(
      new Response('{"message":"upstream error"}', { status: 502 }),
      new Request('https://example.com/hook', { method: 'POST' }),

      {} as NormalizedOptions
    );
    sendWebhookRequest.mockRejectedValueOnce(httpError);

    const handler = createWebhookJobHandler({ findHookForDelivery });
    const result = await handler.handle(createClaimedJob());

    expect(result.status).toBe('fail');
    expect(result.meta?.log?.key).toBe(`TriggerHook.${InteractionHookEvent.PostSignIn}`);
    expect(result.meta?.log?.payload).toMatchObject({
      result: LogResult.Error,
      hookId: 'hook-1',
      response: { statusCode: 502, body: { message: 'upstream error' } },
    });
    expect(result.meta?.log?.payload.error).toContain('502');
  });

  it('records network or invalid-URL errors without response metadata and returns fail', async () => {
    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    sendWebhookRequest.mockRejectedValueOnce(new TypeError('Failed to parse URL from bad-url'));

    const handler = createWebhookJobHandler({ findHookForDelivery });
    const result = await handler.handle(createClaimedJob());

    expect(result.status).toBe('fail');
    expect(result.meta?.log?.payload).toMatchObject({
      result: LogResult.Error,
      hookId: 'hook-1',
    });
    expect(result.meta?.log?.payload.error).toContain('Failed to parse URL from bad-url');
    expect(result.meta?.log?.payload).not.toHaveProperty('response');
  });

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

  it('aborts the delivery signal once the attempt ends', async () => {
    findHookForDelivery.mockResolvedValueOnce(createHookRecord());
    sendWebhookRequest.mockRejectedValueOnce(new Error('Request timed out'));

    const handler = createWebhookJobHandler({ findHookForDelivery });
    await handler.handle(createClaimedJob());

    const sentRequest = sendWebhookRequest.mock.calls[0]?.[0] as { signal?: AbortSignal };
    expect(sentRequest.signal?.aborted).toBe(true);
  });
});
