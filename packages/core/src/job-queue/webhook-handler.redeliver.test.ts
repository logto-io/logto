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
  serializeWebhookRedeliveryJobPayload,
  webhookJobLeaseMs,
  webhookJobType,
} = await import('./webhook-handler.js');

const createHookRecord = (overrides?: Partial<WebhookDeliveryHook>): WebhookDeliveryHook => ({
  id: 'hook-1',
  config: { url: 'https://example.com/hook', headers: { 'x-test': '1' }, retries: 3 },
  signingKey: 'live-signing-key',
  enabled: true,
  ...overrides,
});

const createHttpError = (status: number) =>
  new HTTPError(
    new Response(`status ${status}`, { status }),
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
  id: 'redelivery-log-1',
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

describe('webhook job handler redelivery envelope', () => {
  const findHookForDelivery = jest.fn<
    Promise<Nullable<WebhookDeliveryHook>>,
    [tenantId: string, hookId: string]
  >();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('parses redelivery envelopes, sends rawBody verbatim, and attaches redeliveredFrom to log metadata', async () => {
    const envelopePayload = serializeWebhookRedeliveryJobPayload({
      rawBody: rawPayload,
      redeliveredFrom: 'original-log-1',
    });

    expect(parseWebhookJobPayload(envelopePayload)).toEqual({
      event: InteractionHookEvent.PostSignIn,
      rawBody: rawPayload,
      redeliveredFrom: 'original-log-1',
      body: JSON.parse(rawPayload) as Record<string, unknown>,
    });

    expect(() =>
      parseWebhookJobPayload(
        JSON.stringify({
          rawBody: JSON.stringify({ event: 'Unknown.Event' }),
          redeliveredFrom: 'original-log-1',
        })
      )
    ).toThrow();
    expect(() =>
      parseWebhookJobPayload(
        JSON.stringify({
          rawBody: rawPayload,
          redeliveredFrom: '',
        })
      )
    ).toThrow();

    const hook = createHookRecord();
    const handler = createWebhookJobHandler({ findHookForDelivery });
    const redeliveryJob = createClaimedJob({
      rawPayload: envelopePayload,
      payload: parseWebhookJobPayload(envelopePayload),
    });

    findHookForDelivery.mockResolvedValueOnce(hook);
    sendWebhookRequest.mockResolvedValueOnce({
      status: 200,
      text: async () => '{"ok":true}',
    });
    const successResult = await handler.handle(redeliveryJob);
    expect(sendWebhookRequest).toHaveBeenCalledWith({
      hookConfig: hook.config,
      body: rawPayload,
      signingKey: hook.signingKey,
      signal: expect.any(AbortSignal) as AbortSignal,
      disableRetries: true,
    });
    expect(successResult.status).toBe('done');
    expect(successResult.meta?.log?.payload).toMatchObject({
      result: LogResult.Success,
      redeliveredFrom: 'original-log-1',
    });

    findHookForDelivery.mockResolvedValueOnce(hook);
    sendWebhookRequest.mockRejectedValueOnce(createHttpError(503));
    const retryResult = await handler.handle(redeliveryJob);
    expect(retryResult.status).toBe('retry');
    expect(retryResult.meta?.log?.payload).toMatchObject({
      result: LogResult.Error,
      redeliveredFrom: 'original-log-1',
    });

    findHookForDelivery.mockResolvedValueOnce(hook);
    sendWebhookRequest.mockRejectedValueOnce(createHttpError(400));
    const failResult = await handler.handle(redeliveryJob);
    expect(failResult.status).toBe('fail');
    expect(failResult.meta?.log?.payload).toMatchObject({
      result: LogResult.Error,
      redeliveredFrom: 'original-log-1',
    });
  });
});
