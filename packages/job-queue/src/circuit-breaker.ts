import { type ClaimedJobRow, type JobGroup } from './types.js';

export type GroupCircuitConstraint = 'closed' | 'blocked' | 'probe';

type CircuitEntry = {
  tenantId?: string;
  type: string;
  groupKey: string;
  consecutiveFailures: number;
  isOpen: boolean;
  step: number;
  nextProbeAt: number;
  probeJobId?: string;
  expiresAt: number;
};

export type RecordCircuitFailureInput = {
  job: Pick<ClaimedJobRow, 'id' | 'tenantId' | 'type' | 'groupKey'>;
  threshold: number;
  backoffMs: (attempt: number) => number;
  maxAgeMs?: number;
  retryAfterMs?: number;
  now: number;
};

export type RecordCircuitFailureResult = {
  shouldPark: boolean;
  nextAttemptAt: number;
};

const minEntryTtlMs = 60_000;

const toGroupMapKey = ({ tenantId, type, groupKey }: JobGroup): string =>
  JSON.stringify([tenantId ?? null, type, groupKey]);

const isExpired = (entry: CircuitEntry, now: number): boolean =>
  entry.probeJobId === undefined && now >= entry.expiresAt;

/**
 * Tracks per-`(tenantId, type, groupKey)` circuit breaker state in memory.
 *
 * After `failureThreshold` consecutive failures on a group, the circuit opens and parks due
 * waiting rows to the next backoff step, allowing only a single probe per step until a probe
 * succeeds.
 */
export class GroupCircuitBreakerTracker {
  private readonly entries = new Map<string, CircuitEntry>();

  getGroupConstraint(group: JobGroup, now: number): GroupCircuitConstraint {
    const key = toGroupMapKey(group);
    const entry = this.entries.get(key);

    if (entry && isExpired(entry, now)) {
      this.entries.delete(key);
      return 'closed';
    }

    if (!entry?.isOpen) {
      return 'closed';
    }

    if (entry.probeJobId !== undefined || now < entry.nextProbeAt) {
      return 'blocked';
    }

    return 'probe';
  }

  getTrackedGroups(now: number): JobGroup[] {
    this.#pruneExpired(now);

    return Array.from(this.entries.values())
      .filter((entry) => entry.isOpen)
      .map(({ tenantId, type, groupKey }) => ({ tenantId, type, groupKey }));
  }

  getOpenCount(now: number): number {
    this.#pruneExpired(now);

    return Array.from(this.entries.values()).filter((entry) => entry.isOpen).length;
  }

  tryAcquireProbe(
    job: Pick<ClaimedJobRow, 'id' | 'tenantId' | 'type' | 'groupKey'>,
    now: number
  ): 'normal' | 'probe' | 'reject' {
    const constraint = this.getGroupConstraint(job, now);

    if (constraint === 'closed') {
      return 'normal';
    }

    if (constraint === 'blocked') {
      return 'reject';
    }

    const key = toGroupMapKey(job);
    const entry = this.entries.get(key);

    if (!entry) {
      return 'normal';
    }

    this.entries.set(key, { ...entry, probeJobId: job.id });

    return 'probe';
  }

  releaseProbe(job: Pick<ClaimedJobRow, 'id' | 'tenantId' | 'type' | 'groupKey'>): void {
    const key = toGroupMapKey(job);
    const entry = this.entries.get(key);

    if (entry?.probeJobId === job.id) {
      this.entries.set(key, { ...entry, probeJobId: undefined });
    }
  }

  /**
   * Reset circuit state after a successful job in `group`.
   * Returns `true` when an open circuit just closed.
   */
  recordSuccess(group: JobGroup): boolean {
    const key = toGroupMapKey(group);
    const entry = this.entries.get(key);
    this.entries.delete(key);

    return entry?.isOpen === true;
  }

  recordFailure({
    job,
    threshold,
    backoffMs,
    maxAgeMs,
    retryAfterMs,
    now,
  }: RecordCircuitFailureInput): RecordCircuitFailureResult {
    const key = toGroupMapKey(job);
    const current = this.entries.get(key);
    const expiresAt =
      maxAgeMs !== undefined && Number.isFinite(maxAgeMs)
        ? now + Math.max(maxAgeMs, minEntryTtlMs)
        : Number.POSITIVE_INFINITY;

    if (!current?.isOpen) {
      return this.#recordClosedFailure({
        key,
        current,
        job,
        threshold,
        backoffMs,
        retryAfterMs,
        now,
        expiresAt,
      });
    }

    return this.#recordOpenFailure({
      key,
      current,
      jobId: job.id,
      backoffMs,
      retryAfterMs,
      now,
      expiresAt,
    });
  }

  #recordClosedFailure({
    key,
    current,
    job,
    threshold,
    backoffMs,
    retryAfterMs,
    now,
    expiresAt,
  }: {
    key: string;
    current?: CircuitEntry;
    job: Pick<ClaimedJobRow, 'tenantId' | 'type' | 'groupKey'>;
    threshold: number;
    backoffMs: (attempt: number) => number;
    retryAfterMs?: number;
    now: number;
    expiresAt: number;
  }): RecordCircuitFailureResult {
    const consecutiveFailures = (current?.consecutiveFailures ?? 0) + 1;

    if (consecutiveFailures >= threshold) {
      const nextAttemptAt = now + Math.max(0, retryAfterMs ?? backoffMs(1));
      this.entries.set(key, {
        tenantId: job.tenantId,
        type: job.type,
        groupKey: job.groupKey,
        consecutiveFailures,
        isOpen: true,
        step: 1,
        nextProbeAt: nextAttemptAt,
        expiresAt,
      });

      return { shouldPark: true, nextAttemptAt };
    }

    this.entries.set(key, {
      tenantId: job.tenantId,
      type: job.type,
      groupKey: job.groupKey,
      consecutiveFailures,
      isOpen: false,
      step: 0,
      nextProbeAt: 0,
      expiresAt,
    });

    return { shouldPark: false, nextAttemptAt: 0 };
  }

  #recordOpenFailure({
    key,
    current,
    jobId,
    backoffMs,
    retryAfterMs,
    now,
    expiresAt,
  }: {
    key: string;
    current: CircuitEntry;
    jobId: string;
    backoffMs: (attempt: number) => number;
    retryAfterMs?: number;
    now: number;
    expiresAt: number;
  }): RecordCircuitFailureResult {
    if (current.probeJobId === jobId) {
      const nextStep = current.step + 1;
      const nextAttemptAt = now + Math.max(0, retryAfterMs ?? backoffMs(nextStep));
      this.entries.set(key, {
        ...current,
        consecutiveFailures: current.consecutiveFailures + 1,
        step: nextStep,
        nextProbeAt: nextAttemptAt,
        probeJobId: undefined,
        expiresAt,
      });

      return { shouldPark: true, nextAttemptAt };
    }

    // Late failure from a concurrent job claimed before the circuit opened: preserve probe state.
    this.entries.set(key, {
      ...current,
      consecutiveFailures: current.consecutiveFailures + 1,
      expiresAt,
    });

    return { shouldPark: false, nextAttemptAt: current.nextProbeAt };
  }

  #pruneExpired(now: number): void {
    for (const [key, entry] of this.entries) {
      if (isExpired(entry, now)) {
        this.entries.delete(key);
      }
    }
  }
}
