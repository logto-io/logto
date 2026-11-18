import { describe, expect, it } from 'vitest';

import { createExponentialBackoff, resolveRetryDecision } from './job-state.js';
import { type JobRetryPolicy } from './types.js';

describe('createExponentialBackoff', () => {
  it('grows exponentially from baseMs and caps at maxMs', () => {
    const webhookBackoff = createExponentialBackoff({
      baseMs: 10_000,
      maxMs: 4 * 60 * 60 * 1000,
    });

    expect(webhookBackoff(1)).toBe(10_000);
    expect(webhookBackoff(2)).toBe(20_000);
    expect(webhookBackoff(3)).toBe(40_000);
    expect(webhookBackoff(4)).toBe(80_000);
    expect(webhookBackoff(20)).toBe(4 * 60 * 60 * 1000);
  });

  it('supports custom multipliers and clamps sub-1 attempts to attempt 1', () => {
    const customBackoff = createExponentialBackoff({
      baseMs: 1000,
      maxMs: 300_000,
      factor: 3,
    });

    expect(customBackoff(0)).toBe(1000);
    expect(customBackoff(1)).toBe(1000);
    expect(customBackoff(2)).toBe(3000);
    expect(customBackoff(3)).toBe(9000);
    expect(customBackoff(10)).toBe(300_000);
  });
});

describe('resolveRetryDecision', () => {
  const backoffMs = createExponentialBackoff({
    baseMs: 10_000,
    maxMs: 4 * 60 * 60 * 1000,
  });
  const maxAgeMs = 24 * 60 * 60 * 1000;
  const retry = { backoffMs, maxAgeMs };
  const createdAt = 1_000_000;

  it('uses backoffMs when retryAfterMs is absent', () => {
    expect(
      resolveRetryDecision({
        attempt: 1,
        createdAt,
        now: createdAt + 1000,
        retry,
      })
    ).toEqual({
      status: 'retry',
      delayMs: 10_000,
      nextAttemptAt: createdAt + 11_000,
    });

    expect(
      resolveRetryDecision({
        attempt: 3,
        createdAt,
        now: createdAt + 1000,
        retry,
      })
    ).toEqual({
      status: 'retry',
      delayMs: 40_000,
      nextAttemptAt: createdAt + 41_000,
    });
  });

  it('honors retryAfterMs overrides including 0', () => {
    expect(
      resolveRetryDecision({
        attempt: 2,
        createdAt,
        now: createdAt + 5000,
        retry,
        retryAfterMs: 120_000,
      })
    ).toEqual({
      status: 'retry',
      delayMs: 120_000,
      nextAttemptAt: createdAt + 125_000,
    });

    expect(
      resolveRetryDecision({
        attempt: 2,
        createdAt,
        now: createdAt + 5000,
        retry,
        retryAfterMs: 0,
      })
    ).toEqual({
      status: 'retry',
      delayMs: 0,
      nextAttemptAt: createdAt + 5000,
    });
  });

  it('exhausts when now reaches the maxAgeMs deadline or nextAttemptAt exceeds it', () => {
    const deadline = createdAt + maxAgeMs;

    expect(
      resolveRetryDecision({
        attempt: 1,
        createdAt,
        now: deadline,
        retry,
        retryAfterMs: 0,
      })
    ).toEqual({ status: 'exhausted' });

    expect(
      resolveRetryDecision({
        attempt: 1,
        createdAt,
        now: deadline - 5000,
        retry,
      })
    ).toEqual({ status: 'exhausted' });

    expect(
      resolveRetryDecision({
        attempt: 1,
        createdAt,
        now: deadline - 10_000,
        retry,
      })
    ).toEqual({
      status: 'retry',
      delayMs: 10_000,
      nextAttemptAt: deadline,
    });
  });

  it('exhausts when optional maxAttempts is reached even with infinite maxAgeMs', () => {
    const attemptCappedRetry = {
      backoffMs: createExponentialBackoff({ baseMs: 1000, maxMs: 300_000 }),
      maxAgeMs: Number.POSITIVE_INFINITY,
      maxAttempts: 5,
    };

    expect(
      resolveRetryDecision({
        attempt: 4,
        createdAt,
        now: createdAt + 1_000_000,
        retry: attemptCappedRetry,
      })
    ).toEqual({
      status: 'retry',
      delayMs: 8000,
      nextAttemptAt: createdAt + 1_008_000,
    });

    expect(
      resolveRetryDecision({
        attempt: 5,
        createdAt,
        now: createdAt + 1_000_000,
        retry: attemptCappedRetry,
      })
    ).toEqual({ status: 'exhausted' });
  });

  it('supports maxAttempts without maxAgeMs and rejects policies missing both bounds', () => {
    const attemptOnlyRetry: JobRetryPolicy = {
      backoffMs: createExponentialBackoff({ baseMs: 1000, maxMs: 300_000 }),
      maxAttempts: 5,
    };

    // @ts-expect-error -- JobRetryPolicy requires at least one of maxAgeMs or maxAttempts
    const invalidRetry: JobRetryPolicy = { backoffMs };
    expect(invalidRetry).toBeDefined();

    expect(
      resolveRetryDecision({
        attempt: 4,
        createdAt,
        now: createdAt + 100_000_000,
        retry: attemptOnlyRetry,
      })
    ).toEqual({
      status: 'retry',
      delayMs: 8000,
      nextAttemptAt: createdAt + 100_008_000,
    });

    expect(
      resolveRetryDecision({
        attempt: 5,
        createdAt,
        now: createdAt + 100_000_000,
        retry: attemptOnlyRetry,
      })
    ).toEqual({ status: 'exhausted' });
  });
});
