import { type GroupCircuitBreakerTracker } from './circuit-breaker.js';
import {
  type ClaimDueInput,
  type ClaimedJobRow,
  type GroupRemainingSlots,
  type JobCircuitBreakerPolicy,
  type JobLimitsPolicy,
  type RegisteredJobTypeConfig,
  type SaturatedGroup,
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
  tenantId: string;
  type: string;
  groupKey: string;
  count: number;
};

export type ConcurrencyHandlerInfo = {
  type: string;
  leaseMs: number;
  limits: JobLimitsPolicy;
  circuitBreaker?: JobCircuitBreakerPolicy;
};

const toJobKey = (job: Pick<ClaimedJobRow, 'id' | 'attempts'>): string =>
  JSON.stringify([job.id, job.attempts]);

const toTenantTypeKey = (tenantId: string, type: string): string =>
  JSON.stringify([tenantId, type]);

const toGroupKey = ({ tenantId, type, groupKey }: SaturatedGroup): string =>
  JSON.stringify([tenantId, type, groupKey]);

/** Tracks active jobs and per-instance, per-`(tenantId, type)`, and per-group slot usage. */
export class ConcurrencyTracker {
  private readonly inFlightJobs = new Map<string, InFlightJobEntry>();
  private readonly tenantCounts = new Map<string, number>();
  private readonly tenantTypeEntries = new Map<string, TenantTypeCountEntry>();
  private readonly groupEntries = new Map<string, GroupCountEntry>();
  private readonly pendingReleaseJobs = new Map<string, ClaimedJobRow>();

  get inFlightCount(): number {
    return this.inFlightJobs.size;
  }

  getInFlightCountForTenant(tenantId: string, type?: string): number {
    if (type !== undefined) {
      return this.tenantTypeEntries.get(toTenantTypeKey(tenantId, type))?.count ?? 0;
    }

    return this.tenantCounts.get(tenantId) ?? 0;
  }

  getInFlightCountForGroup(tenantId: string, type: string, groupKey: string): number {
    return this.groupEntries.get(toGroupKey({ tenantId, type, groupKey }))?.count ?? 0;
  }

  acquire(job: ClaimedJobRow, promise: Promise<void>): void {
    const jobKey = toJobKey(job);
    this.inFlightJobs.set(jobKey, { job, promise, released: false });

    this.tenantCounts.set(job.tenantId, (this.tenantCounts.get(job.tenantId) ?? 0) + 1);

    const tenantTypeKey = toTenantTypeKey(job.tenantId, job.type);
    const tenantTypeEntry = this.tenantTypeEntries.get(tenantTypeKey);
    this.tenantTypeEntries.set(tenantTypeKey, {
      tenantId: job.tenantId,
      type: job.type,
      count: (tenantTypeEntry?.count ?? 0) + 1,
    });

    const groupKey = toGroupKey(job);
    const groupEntry = this.groupEntries.get(groupKey);
    this.groupEntries.set(groupKey, {
      tenantId: job.tenantId,
      type: job.type,
      groupKey: job.groupKey,
      count: (groupEntry?.count ?? 0) + 1,
    });
  }

  release(
    job: ClaimedJobRow,
    limits: {
      maxConcurrency: number;
      perTenantConcurrency: number;
      perGroupConcurrency: number;
    }
  ): { unblockedCap: boolean; wasReleasedInBatch: boolean } {
    const jobKey = toJobKey(job);
    const existing = this.inFlightJobs.get(jobKey);

    if (!existing) {
      return { unblockedCap: false, wasReleasedInBatch: false };
    }

    const previousTotal = this.inFlightJobs.size;
    const previousTenantType = this.getInFlightCountForTenant(job.tenantId, job.type);
    const previousGroup = this.getInFlightCountForGroup(job.tenantId, job.type, job.groupKey);

    this.inFlightJobs.delete(jobKey);
    this.#decrementTenantCounts(job);
    this.#decrementGroupCount(job);

    const unblockedInstance =
      previousTotal >= limits.maxConcurrency && this.inFlightJobs.size < limits.maxConcurrency;
    const unblockedTenant =
      previousTenantType >= limits.perTenantConcurrency &&
      this.getInFlightCountForTenant(job.tenantId, job.type) < limits.perTenantConcurrency;
    const unblockedGroup =
      previousGroup >= limits.perGroupConcurrency &&
      this.getInFlightCountForGroup(job.tenantId, job.type, job.groupKey) <
        limits.perGroupConcurrency;

    return {
      unblockedCap: unblockedInstance || unblockedTenant || unblockedGroup,
      wasReleasedInBatch: existing.released,
    };
  }

  stageForRelease(job: ClaimedJobRow): void {
    this.pendingReleaseJobs.set(toJobKey(job), job);
  }

  takeStagedJobsToRelease(): ClaimedJobRow[] {
    const staged = Array.from(this.pendingReleaseJobs.values());
    this.pendingReleaseJobs.clear();
    return staged;
  }

  takeJobsToRelease(): ClaimedJobRow[] {
    const staged = this.takeStagedJobsToRelease();

    const active = Array.from(this.inFlightJobs.entries())
      .filter(([, entry]) => !entry.released)
      .map(([key, entry]) => {
        this.inFlightJobs.set(key, { ...entry, released: true });
        return entry.job;
      });

    return [...staged, ...active];
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
        perGroupConcurrency: limits.perGroupConcurrency,
        perTenantConcurrency: limits.perTenantConcurrency,
      })
    );

    const { saturatedTenants, tenantRemainingSlots } = this.#collectTenantConstraints(handlers);
    const { saturatedGroups, groupRemainingSlots } = this.#collectGroupConstraints({
      handlers,
      circuitBreaker,
      now,
    });

    return {
      workerId,
      limit,
      types,
      saturatedTenants,
      saturatedGroups,
      tenantRemainingSlots,
      groupRemainingSlots,
    };
  }

  #decrementTenantCounts(job: Pick<ClaimedJobRow, 'tenantId' | 'type'>): void {
    const nextTenantCount = (this.tenantCounts.get(job.tenantId) ?? 0) - 1;

    if (nextTenantCount <= 0) {
      this.tenantCounts.delete(job.tenantId);
    } else {
      this.tenantCounts.set(job.tenantId, nextTenantCount);
    }

    const tenantTypeKey = toTenantTypeKey(job.tenantId, job.type);
    const nextTenantTypeCount = (this.tenantTypeEntries.get(tenantTypeKey)?.count ?? 0) - 1;

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

  #decrementGroupCount(job: SaturatedGroup): void {
    const groupKey = toGroupKey(job);
    const nextGroupCount = (this.groupEntries.get(groupKey)?.count ?? 0) - 1;

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

  #collectTenantConstraints(handlers: ReadonlyMap<string, ConcurrencyHandlerInfo>): {
    saturatedTenants: string[];
    tenantRemainingSlots: TenantRemainingSlots[];
  } {
    const registeredHandlers = Array.from(handlers.values());

    const tenantRemainingSlots = Array.from(this.tenantTypeEntries.values()).flatMap(
      ({ tenantId, type, count }) => {
        const handler = handlers.get(type);

        if (!handler) {
          return [];
        }

        return [
          {
            tenantId,
            type,
            remainingSlots: Math.max(0, handler.limits.perTenantConcurrency - count),
          },
        ];
      }
    );

    const saturatedTenants = Array.from(this.tenantCounts.keys()).filter((tenantId) =>
      registeredHandlers.every(
        (handler) =>
          this.getInFlightCountForTenant(tenantId, handler.type) >=
          handler.limits.perTenantConcurrency
      )
    );

    return { saturatedTenants, tenantRemainingSlots };
  }

  #collectGroupConstraints({
    handlers,
    circuitBreaker,
    now,
  }: {
    handlers: ReadonlyMap<string, ConcurrencyHandlerInfo>;
    circuitBreaker: GroupCircuitBreakerTracker;
    now: number;
  }): {
    saturatedGroups: SaturatedGroup[];
    groupRemainingSlots: GroupRemainingSlots[];
  } {
    const trackedGroups = new Map<string, SaturatedGroup>();

    for (const entry of this.groupEntries.values()) {
      const group = { tenantId: entry.tenantId, type: entry.type, groupKey: entry.groupKey };
      trackedGroups.set(toGroupKey(group), group);
    }

    for (const group of circuitBreaker.getTrackedGroups(now)) {
      trackedGroups.set(toGroupKey(group), group);
    }

    const groupRemainingSlots = Array.from(trackedGroups.values()).flatMap((group) => {
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

      return [{ ...group, remainingSlots }];
    });

    const saturatedGroups = groupRemainingSlots
      .filter(({ remainingSlots }) => remainingSlots <= 0)
      .map(({ tenantId, type, groupKey }) => ({ tenantId, type, groupKey }));

    return { saturatedGroups, groupRemainingSlots };
  }

  #computeGroupRemainingSlots({
    group,
    handler,
    circuitBreaker,
    now,
  }: {
    group: SaturatedGroup;
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

    const cap =
      constraint === 'probe'
        ? Math.min(1, handler.limits.perGroupConcurrency)
        : handler.limits.perGroupConcurrency;

    return Math.max(0, cap - inFlight);
  }
}
