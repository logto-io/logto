import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createExponentialBackoff } from './job-state.js';
import { type ClaimedJobRow, type JobQueueQueries } from './types.js';
import { JobQueueWorker } from './worker.js';

const retry = {
  backoffMs: createExponentialBackoff({ baseMs: 10_000, maxMs: 60_000 }),
  maxAttempts: 3,
};

const buildRow = (overrides: Partial<ClaimedJobRow> = {}): ClaimedJobRow => ({
  tenantId: 't1',
  id: 'job_1',
  type: 'webhook',
  groupKey: 'hook_1',
  dedupeKey: null,
  payload: '{}',
  attempts: 3,
  nextAttemptAt: 70_000,
  claimedBy: 'worker_1',
  createdAt: 1000,
  ...overrides,
});

describe('JobQueueWorker settlement edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the last allowed attempt but settles an over-budget reclaim without running it', async () => {
    const finalAttempt = buildRow({ id: 'final_attempt', attempts: 1 });
    const reclaimed = buildRow({ id: 'reclaimed', attempts: 2 });
    const settle = vi.fn<JobQueueQueries['settle']>(async () => 'settled');
    const handle = vi.fn(async () => ({ status: 'done' as const }));
    const onExhausted = vi.fn();
    const worker = new JobQueueWorker({
      claimDue: vi
        .fn<JobQueueQueries['claimDue']>()
        .mockResolvedValueOnce([finalAttempt, reclaimed])
        .mockResolvedValue([]),
      settle,
    });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry: { ...retry, maxAttempts: 1 },
      circuitBreaker: { failureThreshold: 1 },
      handle,
      onExhausted,
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);

    expect(handle).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: finalAttempt.id })
    );
    expect(settle).toHaveBeenCalledWith(
      expect.objectContaining({ job: finalAttempt, resolution: { status: 'done' } })
    );
    expect(settle).toHaveBeenCalledWith(
      expect.objectContaining({ job: reclaimed, resolution: { status: 'exhausted' } })
    );
    expect(onExhausted).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: reclaimed.id })
    );
    expect(worker.openCircuitCount).toBe(0);

    await worker.stop();
  });

  it('does not count permanent failures toward the circuit breaker', async () => {
    const rows = ['fail_1', 'fail_2', 'fail_3'].map((id) => buildRow({ id, attempts: 1 }));
    const parkDueGroup = vi.fn<NonNullable<JobQueueQueries['parkDueGroup']>>(async () => 0);
    const worker = new JobQueueWorker({
      claimDue: vi
        .fn<JobQueueQueries['claimDue']>()
        .mockResolvedValueOnce(rows)
        .mockResolvedValue([]),
      settle: vi.fn<JobQueueQueries['settle']>(async () => 'settled'),
      parkDueGroup,
    });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      circuitBreaker: { failureThreshold: 2 },
      handle: async () => ({ status: 'fail' }),
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);

    expect(worker.openCircuitCount).toBe(0);
    expect(parkDueGroup).not.toHaveBeenCalled();

    await worker.stop();
  });

  it('expires rows whose retry window ends before the parked attempt time', async () => {
    const maxAgeMs = 24 * 60 * 60 * 1000;
    const now = 2 * maxAgeMs;
    vi.setSystemTime(now);

    const parkDueGroup = vi.fn<NonNullable<JobQueueQueries['parkDueGroup']>>(async () => 0);
    const worker = new JobQueueWorker({
      claimDue: vi
        .fn<JobQueueQueries['claimDue']>()
        .mockResolvedValueOnce([buildRow({ attempts: 1, createdAt: now - 1000 })])
        .mockResolvedValue([]),
      settle: vi.fn<JobQueueQueries['settle']>(async () => 'settled'),
      parkDueGroup,
    });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry: { backoffMs: retry.backoffMs, maxAgeMs },
      circuitBreaker: { failureThreshold: 1 },
      handle: async () => ({ status: 'retry' }),
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);

    expect(parkDueGroup).toHaveBeenCalledExactlyOnceWith({
      tenantId: 't1',
      type: 'webhook',
      groupKey: 'hook_1',
      nextAttemptAt: now + 10_000,
      minCreatedAt: now + 10_000 - maxAgeMs,
    });

    await worker.stop();
  });

  it('skips circuit-breaker and exhaustion updates when settle fails', async () => {
    const row = buildRow({ id: 'job_settle_error', attempts: 3 });
    const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const onExhausted = vi.fn();
    const parkDueGroup = vi.fn<NonNullable<JobQueueQueries['parkDueGroup']>>(async () => 0);
    const queries: JobQueueQueries = {
      claimDue: vi
        .fn<JobQueueQueries['claimDue']>()
        .mockResolvedValueOnce([row])
        .mockResolvedValue([]),
      settle: vi
        .fn<JobQueueQueries['settle']>()
        .mockRejectedValueOnce(new Error('db write failed')),
      parkDueGroup,
    };

    const worker = new JobQueueWorker(queries, { workerId: 'worker_1', log });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      circuitBreaker: { failureThreshold: 1 },
      handle: async () => ({ status: 'retry' }),
      onExhausted,
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);

    expect(log.error).toHaveBeenCalled();
    expect(worker.openCircuitCount).toBe(0);
    expect(parkDueGroup).not.toHaveBeenCalled();
    expect(onExhausted).not.toHaveBeenCalled();
    expect(worker.inFlightCount).toBe(0);

    await worker.stop();
  });
});
