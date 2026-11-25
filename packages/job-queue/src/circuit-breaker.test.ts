import { describe, expect, it } from 'vitest';

import { GroupCircuitBreakerTracker } from './circuit-breaker.js';
import { createExponentialBackoff } from './job-state.js';

const group = { tenantId: 't1', type: 'webhook', groupKey: 'hook_1' };
const makeJob = (id: string) => ({ ...group, id });
const backoffMs = createExponentialBackoff({ baseMs: 10_000, maxMs: 60_000 });
const maxAgeMs = 24 * 60 * 60 * 1000;

describe('GroupCircuitBreakerTracker', () => {
  it('opens after threshold consecutive failures and resets on success before threshold', () => {
    const tracker = new GroupCircuitBreakerTracker();

    for (const index of [1, 2, 3, 4]) {
      expect(
        tracker.recordFailure({
          job: makeJob(`job_${index}`),
          threshold: 5,
          backoffMs,
          maxAgeMs,
          now: 1000,
        })
      ).toEqual({ shouldPark: false, nextAttemptAt: 0 });
    }

    expect(tracker.getGroupConstraint(group, 1000)).toBe('closed');
    expect(tracker.getOpenCount(1000)).toBe(0);

    // A success before the 5th failure resets consecutive failure count.
    expect(tracker.recordSuccess(group)).toBe(false);

    for (const index of [5, 6, 7, 8]) {
      expect(
        tracker.recordFailure({
          job: makeJob(`job_${index}`),
          threshold: 5,
          backoffMs,
          maxAgeMs,
          now: 2000,
        })
      ).toEqual({ shouldPark: false, nextAttemptAt: 0 });
    }

    // 5th consecutive failure opens the circuit and asks to park at backoff step 1 (10s).
    expect(
      tracker.recordFailure({
        job: makeJob('job_9'),
        threshold: 5,
        backoffMs,
        maxAgeMs,
        now: 2000,
      })
    ).toEqual({ shouldPark: true, nextAttemptAt: 12_000 });

    expect(tracker.getOpenCount(2000)).toBe(1);
    expect(tracker.getTrackedGroups(2000)).toEqual([group]);
    expect(tracker.getGroupConstraint(group, 11_999)).toBe('blocked');
    expect(tracker.getGroupConstraint(group, 12_000)).toBe('probe');
  });

  it('allows only one active probe per backoff step and advances step on probe failure', () => {
    const tracker = new GroupCircuitBreakerTracker();

    for (const index of [1, 2, 3, 4, 5]) {
      tracker.recordFailure({
        job: makeJob(`pre_${index}`),
        threshold: 5,
        backoffMs,
        maxAgeMs,
        now: 1000,
      });
    }

    // Before nextProbeAt (11_000), claims for this group are rejected.
    expect(tracker.tryAcquireProbe(makeJob('early'), 5000)).toBe('reject');

    // Late failure of a pre-open sibling does not advance the probe backoff step.
    expect(
      tracker.recordFailure({
        job: makeJob('late_sibling'),
        threshold: 5,
        backoffMs,
        maxAgeMs,
        now: 6000,
      })
    ).toEqual({ shouldPark: false, nextAttemptAt: 11_000 });

    // At nextProbeAt, exactly one probe is admitted.
    expect(tracker.tryAcquireProbe(makeJob('probe_1'), 11_000)).toBe('probe');
    expect(tracker.getGroupConstraint(group, 11_000)).toBe('blocked');
    expect(tracker.tryAcquireProbe(makeJob('probe_extra'), 11_000)).toBe('reject');

    // Probe fails -> step advances to 2 (20_000 ms).
    expect(
      tracker.recordFailure({
        job: makeJob('probe_1'),
        threshold: 5,
        backoffMs,
        maxAgeMs,
        now: 11_500,
      })
    ).toEqual({ shouldPark: true, nextAttemptAt: 31_500 });

    expect(tracker.getGroupConstraint(group, 31_499)).toBe('blocked');
    expect(tracker.getGroupConstraint(group, 31_500)).toBe('probe');

    // Probe succeeds -> closes circuit and notifies caller.
    expect(tracker.tryAcquireProbe(makeJob('probe_2'), 31_500)).toBe('probe');
    expect(tracker.recordSuccess(group)).toBe(true);
    expect(tracker.getOpenCount(31_500)).toBe(0);
    expect(tracker.getGroupConstraint(group, 31_500)).toBe('closed');
  });

  it('treats retryAfterMs as a minimum on top of the probe backoff step', () => {
    const tracker = new GroupCircuitBreakerTracker();
    const fail = (id: string, now: number, retryAfterMs: number) =>
      tracker.recordFailure({
        job: makeJob(id),
        threshold: 1,
        backoffMs,
        maxAgeMs,
        retryAfterMs,
        now,
      });

    // Opening: a zero delay cannot shorten step 1 (10 s).
    expect(fail('job_1', 1000, 0)).toEqual({ shouldPark: true, nextAttemptAt: 11_000 });

    // Probe failure: a short delay cannot shorten step 2 (20 s).
    expect(tracker.tryAcquireProbe(makeJob('probe_1'), 11_000)).toBe('probe');
    expect(fail('probe_1', 11_000, 1000)).toEqual({ shouldPark: true, nextAttemptAt: 31_000 });

    // A delay longer than step 3 (40 s) still pushes the next probe out.
    expect(tracker.tryAcquireProbe(makeJob('probe_2'), 31_000)).toBe('probe');
    expect(fail('probe_2', 31_000, 300_000)).toEqual({ shouldPark: true, nextAttemptAt: 331_000 });
  });

  it('unblocks probe slot via releaseProbe and prunes stale idle circuits past maxAgeMs', () => {
    const tracker = new GroupCircuitBreakerTracker();

    for (const index of [1, 2, 3, 4, 5]) {
      tracker.recordFailure({
        job: makeJob(`job_${index}`),
        threshold: 5,
        backoffMs,
        maxAgeMs: 120_000,
        now: 1000,
      });
    }

    expect(tracker.tryAcquireProbe(makeJob('probe_a'), 11_000)).toBe('probe');
    expect(tracker.getGroupConstraint(group, 11_000)).toBe('blocked');

    tracker.releaseProbe(makeJob('probe_a'));
    expect(tracker.getGroupConstraint(group, 11_000)).toBe('probe');

    // Idle circuit expires after maxAgeMs (1000 + 120_000 = 121_000).
    expect(tracker.tryAcquireProbe(makeJob('after_expiry'), 121_000)).toBe('normal');
    expect(tracker.getOpenCount(121_000)).toBe(0);
  });

  it('supports tenantless groups without maxAgeMs and distinguishes undefined from empty tenantId', () => {
    const tracker = new GroupCircuitBreakerTracker();
    const globalGroup = { type: 'cross_pod', groupKey: 'sync_1' };
    const emptyTenantGroup = { tenantId: '', type: 'cross_pod', groupKey: 'sync_1' };

    expect(
      tracker.recordFailure({
        job: { ...globalGroup, id: 'cp_1' },
        threshold: 1,
        backoffMs,
        now: 1000,
      })
    ).toEqual({ shouldPark: true, nextAttemptAt: 11_000 });

    expect(tracker.getOpenCount(1_000_000_000)).toBe(1);
    expect(tracker.getTrackedGroups(1_000_000_000)).toEqual([globalGroup]);
    expect(tracker.getGroupConstraint(globalGroup, 10_000)).toBe('blocked');
    expect(tracker.getGroupConstraint(emptyTenantGroup, 10_000)).toBe('closed');
  });
});
