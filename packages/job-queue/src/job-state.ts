import { type JobRetryPolicy } from './types.js';

export type ExponentialBackoffOptions = {
  baseMs: number;
  maxMs: number;
};

/**
 * Create an exponential backoff function (`baseMs * 2^(attempt - 1)`) capped at `maxMs`.
 * `attempt` is 1-based.
 */
export const createExponentialBackoff =
  ({ baseMs, maxMs }: ExponentialBackoffOptions) =>
  (attempt: number): number =>
    Math.min(baseMs * 2 ** Math.max(0, attempt - 1), maxMs);

export type ResolveRetryDecisionInput = {
  attempt: number;
  createdAt: number;
  now: number;
  retry: JobRetryPolicy;
  retryAfterMs?: number;
};

export type RetryDecision =
  | { status: 'retry'; delayMs: number; nextAttemptAt: number }
  | { status: 'exhausted' };

/**
 * Decide whether a retryable failure should be rescheduled or marked exhausted against
 * `maxAttempts` and `maxAgeMs`.
 */
export const resolveRetryDecision = ({
  attempt,
  createdAt,
  now,
  retry,
  retryAfterMs,
}: ResolveRetryDecisionInput): RetryDecision => {
  if (retry.maxAttempts !== undefined && attempt >= retry.maxAttempts) {
    return { status: 'exhausted' };
  }

  const delayMs = Math.max(0, retryAfterMs ?? retry.backoffMs(attempt));
  const nextAttemptAt = now + delayMs;

  if (retry.maxAgeMs !== undefined && Number.isFinite(retry.maxAgeMs)) {
    const deadline = createdAt + retry.maxAgeMs;

    if (now >= deadline || nextAttemptAt > deadline) {
      return { status: 'exhausted' };
    }
  }

  return { status: 'retry', delayMs, nextAttemptAt };
};
