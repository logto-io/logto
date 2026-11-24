import { type GroupCircuitBreakerTracker } from './circuit-breaker.js';
import {
  type ClaimDueInput,
  type ClaimedJobRow,
  type GroupRemainingSlots,
  type JobCircuitBreakerPolicy,
  type JobGroup,
  type JobLimitsPolicy,
  type RegisteredJobTypeConfig,
  type TenantRemainingSlots,
} from './types.js';

type InFlightJobEntry = {
  job: ClaimedJobRow;
  promise: Promise<void>;
  released: boolean;
};

type TenantTypeCountEntry = {
  tenantId: string;
  type: string;
  count: number;
};

type GroupCountEntry = {
  tenantId?: string;
  type: string;
  groupKey: string;
  count: number;
};

export type ConcurrencyHandlerInfo = {
  type: string;
  leaseMs: number;
  limits?: JobLimitsPolicy;
  circuitBreaker?: JobCircuitBreakerPolicy;
};

const toJobKey = (job: Pick<ClaimedJobRow, 'id' | 'attempts'>): string =>
  JSON.stringify([job.id, job.attempts]);

const toTenantTypeKey = (tenantId: string, type: string): string =>
  JSON.stringify([tenantId, type]);

const toGroupKey = ({ tenantId, type, groupKey }: JobGroup): string =>
  JSON.stringify([tenantId ?? null, type, groupKey]);

/** Tracks active jobs and per-instance, per-`(tenantId, type)`, and per-group slot usage. */
export class ConcurrencyTracker {
  private readonly inFlightJobs = new Map<string, InFlightJobEntry>();
  private readonly tenantTypeEntries = new Map<string, TenantTypeCountEntry>();
  private readonly groupEntries = new Map<string, GroupCountEntry>();
  private readonly pendingReleaseJobs = new Map<string, ClaimedJobRow>();

  get inFlightCount(): number {
    return this.inFlightJobs.size;
  }

  getInFlightCountForTenant(tenantId: string, type: string): number {
    return this.tenantTypeEntries.get(toTenantTypeKey(tenantId, type))?.count ?? 0;
  }

  getInFlightCountForGroup(tenantId: string | undefined, type: string, groupKey: string): number {
    return this.groupEntries.get(toGroupKey({ tenantId, type, groupKey }))?.count ?? 0;
  }

  acquire(job: ClaimedJobRow, promise: Promise<void>): void {
    this.inFlightJobs.set(toJobKey(job), { job, promise, released: false });
    this.#updateTenantCounts(job, 1);
    this.#updateGroupCount(job, 1);
  }

  release(
    job: ClaimedJobRow,
    limits: {
      maxConcurrency: number;
      perTenantConcurrency?: number;
      perGroupConcurrency?: number;
    }
  ): boolean {
    const jobKey = toJobKey(job);

    if (!this.inFlightJobs.has(jobKey)) {
      return false;
    }

    const perTenantConcurrency = limits.perTenantConcurrency ?? Number.POSITIVE_INFINITY;
    const perGroupConcurrency = limits.perGroupConcurrency ?? Number.POSITIVE_INFINITY;

    const previousTotal = this.inFlightJobs.size;
    const previousTenantType =
      job.tenantId === undefined ? 0 : this.getInFlightCountForTenant(job.tenantId, job.type);
    const previousGroup = this.getInFlightCountForGroup(job.tenantId, job.type, job.groupKey);

    this.inFlightJobs.delete(jobKey);
    this.#updateTenantCounts(job, -1);
    this.#updateGroupCount(job, -1);

    const unblockedInstance =
      previousTotal >= limits.maxConcurrency && this.inFlightJobs.size < limits.maxConcurrency;
    const unblockedTenant =
      job.tenantId !== undefined &&
      previousTenantType >= perTenantConcurrency &&
      this.getInFlightCountForTenant(job.tenantId, job.type) < perTenantConcurrency;
    const unblockedGroup =
      previousGroup >= perGroupConcurrency &&
      this.getInFlightCountForGroup(job.tenantId, job.type, job.groupKey) < perGroupConcurrency;

    return unblockedInstance || unblockedTenant || unblockedGroup;
  }

  stageForRelease(job: ClaimedJobRow): void {
    this.pendingReleaseJobs.set(toJobKey(job), job);
  }

  takeStagedJobsToRelease(): ClaimedJobRow[] {
    const staged = Array.from(this.pendingReleaseJobs.values());
    this.pendingReleaseJobs.clear();
    return staged;
  }

  getActiveJobsToRelease(): ClaimedJobRow[] {
    return Array.from(this.inFlightJobs.values())
      .filter(({ released }) => !released)
      .map(({ job }) => job);
  }

  markReleased(jobs: readonly ClaimedJobRow[]): void {
    for (const job of jobs) {
      const key = toJobKey(job);
      const entry = this.inFlightJobs.get(key);

      if (entry) {
        this.inFlightJobs.set(key, { ...entry, released: true });
      }
    }
  }

  async waitForActive(): Promise<void> {
    const promises = Array.from(this.inFlightJobs.values(), async ({ promise }) => promise);

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  buildClaimDueInput({
    workerId,
    maxConcurrency,
    handlers,
    circuitBreaker,
    now,
  }: {
    workerId: string;
    maxConcurrency: number;
    handlers: ReadonlyMap<string, ConcurrencyHandlerInfo>;
    circuitBreaker: GroupCircuitBreakerTracker;
    now: number;
  }): ClaimDueInput | undefined {
    const limit = maxConcurrency - this.inFlightJobs.size;

    if (handlers.size === 0 || limit <= 0) {
      return undefined;
    }

    const types: RegisteredJobTypeConfig[] = Array.from(handlers.values()).map(
      ({ type, leaseMs, limits }) => ({
        type,
        leaseMs,
        perGroupConcurrency: limits?.perGroupConcurrency,
        perTenantConcurrency: limits?.perTenantConcurrency,
      })
    );

    return {
      workerId,
      limit,
      types,
      tenantRemainingSlots: this.#collectTenantConstraints(handlers),
      groupRemainingSlots: this.#collectGroupConstraints({ handlers, circuitBreaker, now }),
    };
  }

  #updateTenantCounts(job: Pick<ClaimedJobRow, 'tenantId' | 'type'>, delta: 1 | -1): void {
    if (job.tenantId === undefined) {
      return;
    }

    const tenantTypeKey = toTenantTypeKey(job.tenantId, job.type);
    const nextTenantTypeCount = (this.tenantTypeEntries.get(tenantTypeKey)?.count ?? 0) + delta;

    if (nextTenantTypeCount <= 0) {
      this.tenantTypeEntries.delete(tenantTypeKey);
    } else {
      this.tenantTypeEntries.set(tenantTypeKey, {
        tenantId: job.tenantId,
        type: job.type,
        count: nextTenantTypeCount,
      });
    }
  }

  #updateGroupCount(job: JobGroup, delta: 1 | -1): void {
    const groupKey = toGroupKey(job);
    const nextGroupCount = (this.groupEntries.get(groupKey)?.count ?? 0) + delta;

    if (nextGroupCount <= 0) {
      this.groupEntries.delete(groupKey);
    } else {
      this.groupEntries.set(groupKey, {
        tenantId: job.tenantId,
        type: job.type,
        groupKey: job.groupKey,
        count: nextGroupCount,
      });
    }
  }

  #collectTenantConstraints(
    handlers: ReadonlyMap<string, ConcurrencyHandlerInfo>
  ): TenantRemainingSlots[] {
    return Array.from(this.tenantTypeEntries.values()).flatMap(({ tenantId, type, count }) => {
      const perTenantConcurrency = handlers.get(type)?.limits?.perTenantConcurrency;

      if (perTenantConcurrency === undefined) {
        return [];
      }

      return [
        {
          tenantId,
          type,
          remainingSlots: Math.max(0, perTenantConcurrency - count),
        },
      ];
    });
  }

  #collectGroupConstraints({
    handlers,
    circuitBreaker,
    now,
  }: {
    handlers: ReadonlyMap<string, ConcurrencyHandlerInfo>;
    circuitBreaker: GroupCircuitBreakerTracker;
    now: number;
  }): GroupRemainingSlots[] {
    const trackedGroups = new Map<string, JobGroup>();

    for (const entry of this.groupEntries.values()) {
      const group = { tenantId: entry.tenantId, type: entry.type, groupKey: entry.groupKey };
      trackedGroups.set(toGroupKey(group), group);
    }

    for (const group of circuitBreaker.getTrackedGroups(now)) {
      trackedGroups.set(toGroupKey(group), group);
    }

    return Array.from(trackedGroups.values()).flatMap((group) => {
      const handler = handlers.get(group.type);

      if (!handler) {
        return [];
      }

      const remainingSlots = this.#computeGroupRemainingSlots({
        group,
        handler,
        circuitBreaker,
        now,
      });

      return Number.isFinite(remainingSlots) ? [{ ...group, remainingSlots }] : [];
    });
  }

  #computeGroupRemainingSlots({
    group,
    handler,
    circuitBreaker,
    now,
  }: {
    group: JobGroup;
    handler: ConcurrencyHandlerInfo;
    circuitBreaker: GroupCircuitBreakerTracker;
    now: number;
  }): number {
    const inFlight = this.getInFlightCountForGroup(group.tenantId, group.type, group.groupKey);
    const constraint = handler.circuitBreaker
      ? circuitBreaker.getGroupConstraint(group, now)
      : 'closed';

    if (constraint === 'blocked') {
      return 0;
    }

    const perGroupConcurrency = handler.limits?.perGroupConcurrency ?? Number.POSITIVE_INFINITY;
    const cap = constraint === 'probe' ? Math.min(1, perGroupConcurrency) : perGroupConcurrency;

    return Math.max(0, cap - inFlight);
  }
}
