import { noop } from '@silverhand/essentials';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createExponentialBackoff } from './job-state.js';
import { type ClaimedJobRow, type JobQueueQueries } from './types.js';
import { JobQueueWorker } from './worker.js';

const silentLog = { info: noop, warn: noop, error: noop };

const retry = {
  backoffMs: createExponentialBackoff({ baseMs: 10_000, maxMs: 60_000 }),
  maxAgeMs: 24 * 60 * 60 * 1000,
};

const buildRow = (id: string): ClaimedJobRow => ({
  tenantId: 't1',
  id,
  type: 'webhook',
  groupKey: 'hook_1',
  dedupeKey: null,
  payload: '',
  attempts: 1,
  nextAttemptAt: 70_000,
  claimedBy: 'worker_1',
  createdAt: 1000,
});

const buildQueries = (claimDue: JobQueueQueries['claimDue']) => ({
  claimDue: vi.fn(claimDue),
  settle: vi.fn<JobQueueQueries['settle']>(async () => 'settled'),
  releaseClaimed: vi.fn<NonNullable<JobQueueQueries['releaseClaimed']>>(async () => 0),
});

const afterMicrotasks = async (count: number) => {
  for (const _ of Array.from({ length: count })) {
    // eslint-disable-next-line no-await-in-loop -- each await yields exactly one microtask turn
    await Promise.resolve();
  }
};

describe('JobQueueWorker lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('claims again for a wake that lands while a claim cycle is finishing', async () => {
    // A wake can land at any microtask after `claimDue` resolves; none may wait for the poll.
    for (const delay of Array.from({ length: 12 }, (_, index) => index)) {
      const queries = buildQueries(async () => {
        if (queries.claimDue.mock.calls.length === 1) {
          void (async () => {
            await afterMicrotasks(delay);
            worker.wake();
          })();
        }
        return [];
      });
      const worker = new JobQueueWorker(queries, { log: silentLog });
      worker.register<string>({
        type: 'webhook',
        parsePayload: (raw) => raw,
        leaseMs: 60_000,
        retry,
        handle: async () => ({ status: 'done' }),
      });

      worker.start();
      // eslint-disable-next-line no-await-in-loop -- each delay needs its own worker run
      await vi.advanceTimersByTimeAsync(0);

      expect({ delay, claims: queries.claimDue.mock.calls.length }).toEqual({ delay, claims: 2 });
      // eslint-disable-next-line no-await-in-loop -- each delay needs its own worker run
      await worker.stop();
    }
  });

  it('releases rows from a claim that resolves after a timed-out drain released the rest', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const lateClaim = Promise.withResolvers<readonly ClaimedJobRow[]>();
    const slowRow = buildRow('job_slow');
    const lateRow = buildRow('job_late');
    const queries = buildQueries(async () => []);
    queries.claimDue
      .mockResolvedValueOnce([slowRow])
      .mockImplementationOnce(async () => lateClaim.promise);
    const worker = new JobQueueWorker(queries, { workerId: 'worker_1', log: silentLog });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      // Never settles, so `stop()` never finishes draining.
      handle: async () => new Promise(noop),
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    worker.wake();
    await vi.advanceTimersByTimeAsync(0);
    expect(queries.claimDue).toHaveBeenCalledTimes(2);

    // The host's drain budget runs out while a job and a claim are in flight, so it releases
    // claimed rows itself instead of waiting for `stop()`.
    void worker.stop();
    await worker.releaseClaimed();
    expect(queries.releaseClaimed).toHaveBeenLastCalledWith({
      workerId: 'worker_1',
      jobs: [slowRow],
    });

    lateClaim.resolve([lateRow]);
    await vi.advanceTimersByTimeAsync(0);

    expect(queries.releaseClaimed).toHaveBeenLastCalledWith({
      workerId: 'worker_1',
      jobs: [lateRow],
    });
  });
});
