import { describe, expect, it } from 'vitest';

import { LogResult, logContextPayloadGuard } from './logs.js';

describe('logContextPayloadGuard', () => {
  const basePayload = {
    key: 'TriggerHook.PostSignIn',
    result: LogResult.Error,
  };

  it('parses standard log payloads without webhook delivery fields', () => {
    expect(logContextPayloadGuard.parse(basePayload)).toEqual(basePayload);
  });

  it('parses TriggerHook.* log payloads with optional attempts, nextAttemptAt, and redeliveredFrom', () => {
    const retryPayload = {
      ...basePayload,
      attempts: 1,
      nextAttemptAt: 1_794_958_810_000,
    };
    expect(logContextPayloadGuard.parse(retryPayload)).toEqual(retryPayload);

    const zeroAttemptPayload = {
      ...basePayload,
      attempts: 0,
    };
    expect(logContextPayloadGuard.parse(zeroAttemptPayload)).toEqual(zeroAttemptPayload);

    const redeliveredPayload = {
      ...basePayload,
      attempts: 12,
      redeliveredFrom: 'failed_log_id_1',
    };
    expect(logContextPayloadGuard.parse(redeliveredPayload)).toEqual(redeliveredPayload);
  });

  it('rejects invalid attempts, nextAttemptAt, or redeliveredFrom values', () => {
    expect(() => logContextPayloadGuard.parse({ ...basePayload, attempts: -1 })).toThrow();
    expect(() => logContextPayloadGuard.parse({ ...basePayload, attempts: 1.5 })).toThrow();
    expect(() =>
      logContextPayloadGuard.parse({ ...basePayload, nextAttemptAt: '2026-11-18T00:00:00Z' })
    ).toThrow();
    expect(() => logContextPayloadGuard.parse({ ...basePayload, redeliveredFrom: 123 })).toThrow();
  });
});
