import { noop } from '@silverhand/essentials';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createExponentialBackoff } from './job-state.js';
import { type ClaimDueInput, type ClaimedJobRow, type JobQueueQueries } from './types.js';
import { JobQueueWorker } from './worker.js';

const silentLog = { info: noop, warn: noop, error: noop };

const backoffMs = createExponentialBackoff({ baseMs: 10_000, maxMs: 60_000 });
const retry = {
  backoffMs,
  maxAgeMs: 24 * 60 * 60 * 1000,
};

const buildRow = (overrides: Partial<ClaimedJobRow> = {}): ClaimedJobRow => ({
  tenantId: 't1',
  id: 'job_1',
  type: 'webhook',
  groupKey: 'hook_1',
  dedupeKey: null,
  payload: '{}',
  attempts: 1,
  nextAttemptAt: 70_000,
  claimedBy: 'worker_1',
  createdAt: 1000,
  ...overrides,
});

const buildTenantlessRow = (overrides: Partial<ClaimedJobRow> = {}): ClaimedJobRow => ({
  id: 'cp_1',
  type: 'cross_pod',
  groupKey: 'global',
  dedupeKey: null,
  payload: '{}',
  attempts: 1,
  nextAttemptAt: 910_000,
  claimedBy: 'worker_1',
  createdAt: 1000,
  ...overrides,
});

const buildQueries = (overrides: Partial<JobQueueQueries> = {}) => ({
  claimDue: vi.fn<JobQueueQueries['claimDue']>(async () => []),
  settle: vi.fn<JobQueueQueries['settle']>(async () => 'settled'),
  parkDueGroup: vi.fn<NonNullable<JobQueueQueries['parkDueGroup']>>(async () => 0),
  releaseClaimed: vi.fn<NonNullable<JobQueueQueries['releaseClaimed']>>(async () => 0),
  ...overrides,
});

describe('JobQueueWorker concurrency & circuit breaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks instance, tenant, and group slot caps and wakes immediately when a saturated slot frees', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const hookOneDeferredA = Promise.withResolvers<void>();
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const hookOneDeferredB = Promise.withResolvers<void>();
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const hookTwoDeferred = Promise.withResolvers<void>();

    const claimDue = vi
      .fn<JobQueueQueries['claimDue']>()
      .mockResolvedValueOnce([
        buildRow({ id: 'h1_a', tenantId: 't1', groupKey: 'hook_1' }),
        buildRow({ id: 'h1_b', tenantId: 't1', groupKey: 'hook_1' }),
      ])
      .mockResolvedValueOnce([buildRow({ id: 'h2_a', tenantId: 't1', groupKey: 'hook_2' })])
      .mockResolvedValue([]);
    const queries = buildQueries({ claimDue });

    const worker = new JobQueueWorker(queries, {
      workerId: 'worker_1',
      maxConcurrency: 4,
      log: silentLog,
    });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      limits: {
        perGroupConcurrency: 2,
        perTenantConcurrency: 3,
        maxWaitingRowsPerGroup: 10_000,
      },
      handle: async (job) => {
        if (job.id === 'h1_a') {
          await hookOneDeferredA.promise;
        } else if (job.id === 'h1_b') {
          await hookOneDeferredB.promise;
        } else {
          await hookTwoDeferred.promise;
        }
        return { status: 'done' };
      },
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(worker.inFlightCount).toBe(2);

    // Slow hook_1 (now saturated at 2/2) does not block wake() for other groups/tenants.
    worker.wake();
    await vi.advanceTimersByTimeAsync(0);
    expect(claimDue.mock.calls[1]?.[0]).toEqual({
      workerId: 'worker_1',
      limit: 2,
      types: [
        {
          type: 'webhook',
          leaseMs: 60_000,
          perGroupConcurrency: 2,
          perTenantConcurrency: 3,
        },
      ],
      saturatedTenants: [],
      saturatedGroups: [{ tenantId: 't1', type: 'webhook', groupKey: 'hook_1' }],
      tenantRemainingSlots: [{ tenantId: 't1', type: 'webhook', remainingSlots: 1 }],
      groupRemainingSlots: [
        { tenantId: 't1', type: 'webhook', groupKey: 'hook_1', remainingSlots: 0 },
      ],
    });
    expect(worker.inFlightCount).toBe(3);

    // Tenant t1 is now at 3/3 (saturatedTenants includes t1).
    worker.wake();
    await vi.advanceTimersByTimeAsync(0);
    expect(claimDue.mock.calls[2]?.[0]).toEqual(
      expect.objectContaining({
        limit: 1,
        saturatedTenants: ['t1'],
        tenantRemainingSlots: [{ tenantId: 't1', type: 'webhook', remainingSlots: 0 }],
      })
    );

    // Resolving h1_a unblocks both hook_1 and tenant t1, triggering an immediate wake without waiting 5s.
    hookOneDeferredA.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(claimDue).toHaveBeenCalledTimes(4);
    expect(claimDue.mock.calls[3]?.[0]).toEqual(
      expect.objectContaining({
        limit: 2,
        saturatedTenants: [],
        saturatedGroups: [],
        tenantRemainingSlots: [{ tenantId: 't1', type: 'webhook', remainingSlots: 1 }],
        groupRemainingSlots: [
          { tenantId: 't1', type: 'webhook', groupKey: 'hook_1', remainingSlots: 1 },
          { tenantId: 't1', type: 'webhook', groupKey: 'hook_2', remainingSlots: 1 },
        ],
      })
    );

    // Resolving unsaturated h1_b and h2_a does NOT trigger an extra claim before the 5s poll.
    hookOneDeferredB.resolve();
    hookTwoDeferred.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(claimDue).toHaveBeenCalledTimes(4);

    await worker.stop();
  });

  it('scopes saturatedTenants across multiple registered types using per-type tenant caps', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const holdA = Promise.withResolvers<void>();
    const claimDue = vi
      .fn<JobQueueQueries['claimDue']>()
      .mockResolvedValueOnce([
        buildRow({ id: 'a1', tenantId: 't1', type: 'typeA', groupKey: 'g1' }),
      ])
      .mockResolvedValue([]);
    const queries = buildQueries({ claimDue });

    const worker = new JobQueueWorker(queries, { workerId: 'worker_1', log: silentLog });
    worker.register<string>({
      type: 'typeA',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      limits: { perGroupConcurrency: 1, perTenantConcurrency: 1, maxWaitingRowsPerGroup: 100 },
      handle: async () => {
        await holdA.promise;
        return { status: 'done' };
      },
    });
    worker.register<string>({
      type: 'typeB',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      limits: { perGroupConcurrency: 5, perTenantConcurrency: 5, maxWaitingRowsPerGroup: 100 },
      handle: async () => ({ status: 'done' }),
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    worker.wake();
    await vi.advanceTimersByTimeAsync(0);

    // Tenant t1 is saturated for typeA only, so saturatedTenants stays empty while typeA has 0 remaining slots.
    const secondInput: ClaimDueInput | undefined = claimDue.mock.calls[1]?.[0];
    expect(secondInput?.saturatedTenants).toEqual([]);
    expect(secondInput?.tenantRemainingSlots).toEqual([
      { tenantId: 't1', type: 'typeA', remainingSlots: 0 },
    ]);

    holdA.resolve();
    await worker.stop();
  });

  it('opens per-group circuit after 5 failures, parks waiting rows, admits 1 probe per step, and recovers on success', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const probeOneGate = Promise.withResolvers<'retry' | 'done'>();

    const claimDue = vi
      .fn<JobQueueQueries['claimDue']>()
      .mockResolvedValueOnce([
        buildRow({ id: 'f1' }),
        buildRow({ id: 'f2' }),
        buildRow({ id: 'f3' }),
        buildRow({ id: 'f4' }),
        buildRow({ id: 'f5' }),
      ])
      .mockResolvedValueOnce([]) // 15_000 (blocked)
      // Simulate an adapter returning 2 rows when 1 probe slot is allowed to verify defensive release.
      .mockResolvedValueOnce([
        buildRow({ id: 'probe_1', attempts: 2 }),
        buildRow({ id: 'excess_2' }),
      ]) // 20_000
      .mockResolvedValueOnce([]) // 25_000 (probe_1 still in flight)
      .mockResolvedValueOnce([]) // 30_000 (blocked until 45_000)
      .mockResolvedValueOnce([]) // 35_000
      .mockResolvedValueOnce([]) // 40_000
      .mockResolvedValueOnce([buildRow({ id: 'probe_2', attempts: 3 })]) // 45_000 (probe_2 succeeds)
      .mockResolvedValue([]);
    const queries = buildQueries({ claimDue });

    const handle = vi.fn(async (job: { id: string }) => {
      if (job.id.startsWith('f')) {
        return { status: 'retry' as const };
      }
      if (job.id === 'probe_1') {
        return { status: await probeOneGate.promise };
      }
      return { status: 'done' as const };
    });

    const worker = new JobQueueWorker(queries, {
      workerId: 'worker_1',
      log: silentLog,
    });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry,
      limits: {
        perGroupConcurrency: 10,
        perTenantConcurrency: 20,
        maxWaitingRowsPerGroup: 10_000,
      },
      circuitBreaker: { failureThreshold: 5 },
      handle,
    });

    // Claim #1 (10_000): 5 consecutive failures open the circuit and park due rows to 20_000.
    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(worker.openCircuitCount).toBe(1);
    expect(queries.parkDueGroup).toHaveBeenCalledTimes(1);
    expect(queries.parkDueGroup).toHaveBeenCalledWith({
      tenantId: 't1',
      type: 'webhook',
      groupKey: 'hook_1',
      nextAttemptAt: 20_000,
      minCreatedAt: 0,
    });

    // Claim #2 (15_000): group is blocked in saturatedGroups with 0 remaining slots.
    await vi.advanceTimersByTimeAsync(5000);
    expect(claimDue.mock.calls[1]?.[0].saturatedGroups).toEqual([
      { tenantId: 't1', type: 'webhook', groupKey: 'hook_1' },
    ]);
    expect(claimDue.mock.calls[1]?.[0].groupRemainingSlots).toEqual([
      { tenantId: 't1', type: 'webhook', groupKey: 'hook_1', remainingSlots: 0 },
    ]);

    // Claim #3 (20_000): single probe admitted (`remainingSlots: 1`); excess_2 is released immediately.
    await vi.advanceTimersByTimeAsync(5000);
    expect(claimDue.mock.calls[2]?.[0].saturatedGroups).toEqual([]);
    expect(claimDue.mock.calls[2]?.[0].groupRemainingSlots).toEqual([
      { tenantId: 't1', type: 'webhook', groupKey: 'hook_1', remainingSlots: 1 },
    ]);
    expect(queries.releaseClaimed).toHaveBeenCalledWith({
      workerId: 'worker_1',
      jobs: [expect.objectContaining({ id: 'excess_2' })],
    });
    expect(handle).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'excess_2' }));

    // Claim #4 (25_000): while probe_1 is in flight, hook_1 stays blocked.
    await vi.advanceTimersByTimeAsync(5000);
    expect(claimDue.mock.calls[3]?.[0].saturatedGroups).toEqual([
      { tenantId: 't1', type: 'webhook', groupKey: 'hook_1' },
    ]);

    // Probe_1 fails at 25_000 -> re-parks at step 2 (20_000 ms from now = 45_000).
    probeOneGate.resolve('retry');
    await vi.advanceTimersByTimeAsync(0);
    expect(worker.openCircuitCount).toBe(1);
    expect(queries.parkDueGroup).toHaveBeenCalledTimes(2);
    expect(queries.parkDueGroup).toHaveBeenLastCalledWith({
      tenantId: 't1',
      type: 'webhook',
      groupKey: 'hook_1',
      nextAttemptAt: 45_000,
      minCreatedAt: 0,
    });

    // Advance to 45_000 -> probe_2 succeeds -> closes circuit & wakes immediately with full slots.
    await vi.advanceTimersByTimeAsync(20_000);
    expect(worker.openCircuitCount).toBe(0);
    expect(claimDue).toHaveBeenCalledTimes(9);
    expect(claimDue.mock.calls[8]?.[0].saturatedGroups).toEqual([]);
    expect(claimDue.mock.calls[8]?.[0].groupRemainingSlots).toEqual([]);

    await worker.stop();
  });

  it('supports tenantless handlers without limits using circuit breaking and maxAttempts', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const holdInFlight = Promise.withResolvers<void>();
    const probeRow = buildTenantlessRow({ id: 'cp_probe', attempts: 3 });

    const claimDue = vi
      .fn<JobQueueQueries['claimDue']>()
      .mockResolvedValueOnce([buildTenantlessRow({ id: 'cp_hold' })])
      .mockResolvedValueOnce([buildTenantlessRow({ id: 'cp_fail_2' })])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([probeRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([buildTenantlessRow({ id: 'cp_recover', attempts: 1 })])
      .mockResolvedValue([]);
    const queries = buildQueries({ claimDue });
    const onExhausted = vi.fn();

    const worker = new JobQueueWorker(queries, {
      workerId: 'worker_1',
      log: silentLog,
    });
    worker.register<string>({
      type: 'cross_pod',
      parsePayload: (raw) => raw,
      leaseMs: 900_000,
      retry: { backoffMs, maxAttempts: 3 },
      circuitBreaker: { failureThreshold: 2 },
      handle: async (job) => {
        if (job.id === 'cp_hold') {
          await holdInFlight.promise;
          return { status: 'retry' };
        }
        if (job.id === 'cp_recover') {
          return { status: 'done' };
        }
        return { status: 'retry' };
      },
      onExhausted,
    });

    // Claim #1: cp_hold is in flight with closed circuit and no limits -> omitted from groupRemainingSlots.
    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    worker.wake();
    await vi.advanceTimersByTimeAsync(0);

    expect(claimDue.mock.calls[1]?.[0]).toEqual({
      workerId: 'worker_1',
      limit: 99,
      types: [
        {
          type: 'cross_pod',
          leaseMs: 900_000,
          perGroupConcurrency: undefined,
          perTenantConcurrency: undefined,
        },
      ],
      saturatedTenants: [],
      saturatedGroups: [],
      tenantRemainingSlots: [],
      groupRemainingSlots: [],
    });

    // Cp_fail_2 fails (#1), then cp_hold fails (#2) -> circuit opens and parks due jobs.
    holdInFlight.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(worker.openCircuitCount).toBe(1);
    expect(queries.parkDueGroup).toHaveBeenCalledExactlyOnceWith({
      tenantId: undefined,
      type: 'cross_pod',
      groupKey: 'global',
      nextAttemptAt: 20_000,
      minCreatedAt: 0,
    });

    // Claim #3 (15_000): circuit is blocked -> groupRemainingSlots emits 0 and saturatedGroups includes the group.
    await vi.advanceTimersByTimeAsync(5000);
    expect(claimDue.mock.calls[2]?.[0].saturatedGroups).toEqual([
      { tenantId: undefined, type: 'cross_pod', groupKey: 'global' },
    ]);
    expect(claimDue.mock.calls[2]?.[0].groupRemainingSlots).toEqual([
      { tenantId: undefined, type: 'cross_pod', groupKey: 'global', remainingSlots: 0 },
    ]);

    // Claim #4 (20_000): probe slot (1) is emitted; cp_probe hits maxAttempts (3) -> exhausted + re-parks to 40_000.
    await vi.advanceTimersByTimeAsync(5000);
    expect(claimDue.mock.calls[3]?.[0].saturatedGroups).toEqual([]);
    expect(claimDue.mock.calls[3]?.[0].groupRemainingSlots).toEqual([
      { tenantId: undefined, type: 'cross_pod', groupKey: 'global', remainingSlots: 1 },
    ]);
    expect(queries.settle).toHaveBeenLastCalledWith({
      job: probeRow,
      workerId: 'worker_1',
      resolution: { status: 'exhausted', error: undefined },
      meta: undefined,
    });
    expect(onExhausted).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: 'cp_probe', tenantId: undefined })
    );
    expect(queries.parkDueGroup).toHaveBeenLastCalledWith({
      tenantId: undefined,
      type: 'cross_pod',
      groupKey: 'global',
      nextAttemptAt: 40_000,
      minCreatedAt: 0,
    });

    // Advance to 40_000 -> cp_recover succeeds -> circuit closes and immediately wakes next claim.
    await vi.advanceTimersByTimeAsync(20_000);
    expect(worker.openCircuitCount).toBe(0);
    expect(claimDue).toHaveBeenCalledTimes(9);

    await worker.stop();
  });
});
