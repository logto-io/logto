import { noop } from '@silverhand/essentials';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createExponentialBackoff } from './job-state.js';
import { type ClaimedJobRow, type JobQueueQueries } from './types.js';
import { defaultPollIntervalMs, JobQueueWorker } from './worker.js';

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

  it('refills slots freed by jobs finishing during a claim without waiting for the poll', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const first = Promise.withResolvers<void>();
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const second = Promise.withResolvers<void>();
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const claim = Promise.withResolvers<readonly ClaimedJobRow[]>();
    const queries = buildQueries(async () => []);
    queries.claimDue
      .mockResolvedValueOnce([buildRow('first'), buildRow('second')])
      .mockImplementationOnce(async () => claim.promise);
    const worker = new JobQueueWorker(queries, { maxConcurrency: 2, log: silentLog });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      handle: async ({ id }) => {
        await (id === 'first' ? first.promise : second.promise);
        return { status: 'done' };
      },
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    first.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(queries.claimDue).toHaveBeenCalledTimes(2);
    expect(queries.claimDue).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 1 }));

    second.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(queries.claimDue).toHaveBeenCalledTimes(2);
    claim.resolve([]);
    await vi.advanceTimersByTimeAsync(0);
    expect(queries.claimDue).toHaveBeenCalledTimes(3);
    expect(queries.claimDue).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 2 }));
    await worker.stop();
  });

  it('keeps the 5s poll cadence despite intervening wakes', async () => {
    const due = buildRow('due_at_first_poll');
    const queries = buildQueries(async () => []);
    queries.claimDue
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([due]);
    const worker = new JobQueueWorker(queries, { log: silentLog });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      handle: async () => ({ status: 'done' }),
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(2000);
    worker.wake();
    await vi.advanceTimersByTimeAsync(2000);
    worker.wake();
    await vi.advanceTimersByTimeAsync(defaultPollIntervalMs - 4001);
    expect(queries.settle).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(queries.settle).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ job: due }));
    await worker.stop();
  });

  it('retries failed releases and shares the in-flight batch and its affected row count', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const processing = Promise.withResolvers<void>();
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const release = Promise.withResolvers<number>();
    const jobs = [buildRow('first'), buildRow('second')];
    const queries = buildQueries(async () => jobs);
    queries.releaseClaimed
      .mockRejectedValueOnce(new Error('db unavailable'))
      .mockImplementationOnce(async () => release.promise);
    const worker = new JobQueueWorker(queries, { workerId: 'worker_1', log: silentLog });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      handle: async () => {
        await processing.promise;
        return { status: 'done' };
      },
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    const stop = worker.stop();
    await expect(worker.releaseClaimed()).resolves.toBe(0);

    const releaseA = worker.releaseClaimed();
    const releaseB = worker.releaseClaimed();
    expect(queries.releaseClaimed.mock.calls).toEqual([
      [{ workerId: 'worker_1', jobs }],
      [{ workerId: 'worker_1', jobs }],
    ]);
    release.resolve(1);
    await expect(Promise.all([releaseA, releaseB])).resolves.toEqual([1, 1]);
    await expect(worker.releaseClaimed()).resolves.toBe(0);
    expect(queries.releaseClaimed).toHaveBeenCalledTimes(2);

    processing.resolve();
    await stop;
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
    queries.releaseClaimed
      .mockResolvedValueOnce(1)
      .mockRejectedValueOnce(new Error('late release failed'))
      .mockResolvedValueOnce(1);
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
    await expect(worker.releaseClaimed()).resolves.toBe(1);
    expect(queries.releaseClaimed).toHaveBeenCalledTimes(3);
    expect(queries.releaseClaimed).toHaveBeenLastCalledWith({
      workerId: 'worker_1',
      jobs: [lateRow],
    });
  });
});
