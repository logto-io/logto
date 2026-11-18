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

const toGroupKey = ({ tenantId, type, groupKey }: SaturatedGroup): string =>
  JSON.stringify([tenantId ?? null, type, groupKey]);

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
  ): { unblockedCap: boolean; wasReleasedInBatch: boolean } {
    const jobKey = toJobKey(job);
    const existing = this.inFlightJobs.get(jobKey);

    if (!existing) {
      return { unblockedCap: false, wasReleasedInBatch: false };
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
        perGroupConcurrency: limits?.perGroupConcurrency,
        perTenantConcurrency: limits?.perTenantConcurrency,
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

  #updateTenantCounts(job: Pick<ClaimedJobRow, 'tenantId' | 'type'>, delta: 1 | -1): void {
    if (job.tenantId === undefined) {
      return;
    }

    const nextTenantCount = (this.tenantCounts.get(job.tenantId) ?? 0) + delta;

    if (nextTenantCount <= 0) {
      this.tenantCounts.delete(job.tenantId);
    } else {
      this.tenantCounts.set(job.tenantId, nextTenantCount);
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

  #updateGroupCount(job: SaturatedGroup, delta: 1 | -1): void {
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

  #collectTenantConstraints(handlers: ReadonlyMap<string, ConcurrencyHandlerInfo>): {
    saturatedTenants: string[];
    tenantRemainingSlots: TenantRemainingSlots[];
  } {
    const registeredHandlers = Array.from(handlers.values());

    const tenantRemainingSlots = Array.from(this.tenantTypeEntries.values()).flatMap(
      ({ tenantId, type, count }) => {
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
      }
    );

    const saturatedTenants = Array.from(this.tenantCounts.keys()).filter((tenantId) =>
      registeredHandlers.every(
        ({ type, limits }) =>
          limits?.perTenantConcurrency !== undefined &&
          this.getInFlightCountForTenant(tenantId, type) >= limits.perTenantConcurrency
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

      return Number.isFinite(remainingSlots) ? [{ ...group, remainingSlots }] : [];
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

    const perGroupConcurrency = handler.limits?.perGroupConcurrency ?? Number.POSITIVE_INFINITY;
    const cap = constraint === 'probe' ? Math.min(1, perGroupConcurrency) : perGroupConcurrency;

    return Math.max(0, cap - inFlight);
  }
}
