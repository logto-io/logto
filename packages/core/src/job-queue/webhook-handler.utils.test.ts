import { InteractionHookEvent, LogResult } from '@logto/schemas';

import {
  buildExpiredWebhookLog,
  parseRetryAfterMs,
  serializeWebhookRedeliveryJobPayload,
  webhookJobType,
  webhookRetryMaxMs,
} from './webhook-handler.js';

const rawPayload = JSON.stringify({
  event: InteractionHookEvent.PostSignIn,
  createdAt: '2026-11-20T00:00:00.000Z',
  hookId: 'hook-1',
  deliveryId: 'delivery-1',
  userId: 'user-1',
});

describe('parseRetryAfterMs', () => {
  it('parses non-negative integer delay-seconds and caps at 4 hours', () => {
    expect(parseRetryAfterMs('0')).toBe(0);
    expect(parseRetryAfterMs('10')).toBe(10_000);
    expect(parseRetryAfterMs('  120  ')).toBe(120_000);
    expect(parseRetryAfterMs('14400')).toBe(webhookRetryMaxMs);
    expect(parseRetryAfterMs('86400')).toBe(webhookRetryMaxMs);
    expect(parseRetryAfterMs('9'.repeat(400))).toBe(webhookRetryMaxMs);
  });

  it('parses HTTP-date values, clamps past dates to 0, and caps future dates at 4 hours', () => {
    const now = Date.parse('2026-11-21T08:00:00.000Z');
    expect(parseRetryAfterMs('Sat, 21 Nov 2026 08:02:00 GMT', now)).toBe(120_000);
    expect(parseRetryAfterMs('Sat, 21 Nov 2026 20:00:00 GMT', now)).toBe(webhookRetryMaxMs);
    expect(parseRetryAfterMs('Sat, 21 Nov 2026 07:55:00 GMT', now)).toBe(0);
  });

  it('returns undefined for empty or invalid Retry-After values', () => {
    expect(parseRetryAfterMs()).toBeUndefined();
    expect(parseRetryAfterMs(null)).toBeUndefined();
    expect(parseRetryAfterMs('')).toBeUndefined();
    expect(parseRetryAfterMs('   ')).toBeUndefined();
    expect(parseRetryAfterMs('-5')).toBeUndefined();
    expect(parseRetryAfterMs('1.5')).toBeUndefined();
    expect(parseRetryAfterMs('abc')).toBeUndefined();
    expect(parseRetryAfterMs('120s')).toBeUndefined();
  });
});

describe('buildExpiredWebhookLog', () => {
  it('builds a permanent failure log for valid webhook rows', () => {
    const built = buildExpiredWebhookLog({
      tenantId: 'tenant-1',
      id: 'delivery-1',
      type: webhookJobType,
      groupKey: 'hook-1',
      payload: rawPayload,
      attempts: 0,
    });

    expect(built).toEqual({
      key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
      payload: {
        key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
        result: LogResult.Error,
        hookId: 'hook-1',
        attempts: 0,
        hookRequest: { body: JSON.parse(rawPayload) as unknown },
        error: 'Webhook delivery retry window expired while circuit breaker was open.',
      },
    });
  });

  it('preserves redeliveredFrom when a redelivery expires behind an open circuit breaker', () => {
    const built = buildExpiredWebhookLog({
      tenantId: 'tenant-1',
      id: 'redelivery-log-1',
      type: webhookJobType,
      groupKey: 'hook-1',
      payload: serializeWebhookRedeliveryJobPayload({
        rawBody: rawPayload,
        redeliveredFrom: 'failed-log-1',
      }),
      attempts: 0,
    });

    expect(built).toEqual({
      key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
      payload: {
        key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
        result: LogResult.Error,
        hookId: 'hook-1',
        attempts: 0,
        redeliveredFrom: 'failed-log-1',
        hookRequest: { body: JSON.parse(rawPayload) as unknown },
        error: 'Webhook delivery retry window expired while circuit breaker was open.',
      },
    });
  });

  it('returns undefined for non-webhook types or invalid payloads', () => {
    expect(
      buildExpiredWebhookLog({
        tenantId: 'tenant-1',
        id: 'other-1',
        type: 'other',
        groupKey: 'hook-1',
        payload: rawPayload,
        attempts: 0,
      })
    ).toBeUndefined();

    expect(
      buildExpiredWebhookLog({
        tenantId: 'tenant-1',
        id: 'bad-1',
        type: webhookJobType,
        groupKey: 'hook-1',
        payload: 'not-json',
        attempts: 1,
      })
    ).toBeUndefined();
  });
});
