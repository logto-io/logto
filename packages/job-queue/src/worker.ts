import { ConsoleLog, generateStandardId } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import chalk from 'chalk';

import { GroupCircuitBreakerTracker } from './circuit-breaker.js';
import { ConcurrencyTracker } from './concurrency-tracker.js';
import {
  executeRegisteredHandler,
  type RegisteredJobHandler,
  runAndSettleJob,
} from './execute-job.js';
import { type ClaimedJobRow, type JobHandler, type JobQueueQueries } from './types.js';

export const defaultPollIntervalMs = 5000;
export const defaultMaxConcurrency = 100;

export type JobQueueWorkerOptions = {
  /** Unique identifier for this worker process (defaults to a 21-char `generateStandardId()`). */
  workerId?: string;
  /** Maximum total in-flight jobs across all types on this worker instance (default: 100). */
  maxConcurrency?: number;
  /** Periodic poll interval in milliseconds for retries and work enqueued by other instances (default: 5000). */
  pollIntervalMs?: number;
  log?: Pick<ConsoleLog, 'info' | 'warn' | 'error'>;
};

/**
 * DB-agnostic job queue consumer loop supporting per-type leases, single-flight wake coalescing,
 * per-instance / per-tenant / per-group concurrency caps, per-group circuit breaking, fenced
 * settlement, and graceful shutdown drain with batch claim release.
 */
export class JobQueueWorker<SettlementMeta = unknown> {
  public readonly workerId: string;
  private readonly maxConcurrency: number;
  private readonly pollIntervalMs: number;
  private readonly log: Pick<ConsoleLog, 'info' | 'warn' | 'error'>;
  private readonly handlers = new Map<string, RegisteredJobHandler<SettlementMeta>>();
  private readonly concurrency = new ConcurrencyTracker();
  private readonly circuitBreaker = new GroupCircuitBreakerTracker();

  private running = false;
  private stopCompleted = false;
  private dirty = false;
  private timer?: NodeJS.Timeout;
  private claimInFlight?: Promise<void>;
  private releaseInFlight?: { promise: Promise<number>; includesActive: boolean };

  constructor(
    private readonly queries: JobQueueQueries<SettlementMeta>,
    options?: JobQueueWorkerOptions
  ) {
    // Must stay <= 21 chars to match `jobs.claimed_by varchar(21)`; never use `process.pid`.
    this.workerId = options?.workerId ?? generateStandardId();
    this.maxConcurrency = options?.maxConcurrency ?? defaultMaxConcurrency;
    this.pollIntervalMs = options?.pollIntervalMs ?? defaultPollIntervalMs;
    this.log = options?.log ?? new ConsoleLog(chalk.magenta('job-queue'));
  }

  get inFlightCount(): number {
    return this.concurrency.inFlightCount;
  }

  get openCircuitCount(): number {
    return this.circuitBreaker.getOpenCount(Date.now());
  }

  /** Register a typed {@link JobHandler}. Calling again for the same `type` replaces it. */
  register<Payload>(handler: JobHandler<Payload, SettlementMeta>): void {
    this.handlers.set(handler.type, {
      type: handler.type,
      leaseMs: handler.leaseMs,
      limits: handler.limits,
      circuitBreaker: handler.circuitBreaker,
      retry: handler.retry,
      execute: async (row, getNow) => executeRegisteredHandler(handler, row, getNow),
    });
  }

  /** Start polling and immediately trigger a claim cycle. Idempotent. */
  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.stopCompleted = false;
    this.timer = setInterval(() => {
      this.wake();
    }, this.pollIntervalMs);
    this.wake();
  }

  /**
   * Request a claim cycle. Coalesces multiple local wakes into a single follow-up claim when one
   * claim is already in flight.
   */
  wake(): void {
    if (!this.running) {
      return;
    }

    if (this.claimInFlight) {
      this.dirty = true;
      return;
    }

    this.claimInFlight = this.#runClaimCycle();
  }

  /**
   * Stop claiming, drain in-flight work, then batch-release any remaining claims. The shutdown
   * coordinator owns the drain deadline and can call {@link releaseClaimed} if it expires.
   */
  async stop(): Promise<number> {
    this.running = false;
    this.dirty = false;

    clearInterval(this.timer);
    this.timer = undefined;

    await this.#waitForInFlight();
    return this.releaseClaimed();
  }

  /**
   * Batch-release all currently tracked unreleased claimed jobs for this worker. Once stopped,
   * rows from a claim still in flight are released as soon as it resolves, such as when the host
   * gave up on a drain that never finished. Returns the adapter's affected row count, or the
   * batch size on success if the adapter doesn't report a count. Failed batches return zero.
   */
  async releaseClaimed(): Promise<number> {
    if (!this.running) {
      this.stopCompleted = true;
    }

    return this.#releaseJobs(true);
  }

  async #releaseJobs(includesActive: boolean): Promise<number> {
    while (this.releaseInFlight) {
      if (includesActive && this.releaseInFlight.includesActive) {
        return this.releaseInFlight.promise;
      }

      // eslint-disable-next-line no-await-in-loop -- serialize batches before taking the next snapshot
      await this.releaseInFlight.promise;
    }

    const promise = this.#releaseBatch(includesActive);
    this.releaseInFlight = { promise, includesActive };

    try {
      return await promise;
    } finally {
      this.releaseInFlight = undefined;
    }
  }

  async #releaseBatch(includesActive: boolean): Promise<number> {
    const { releaseClaimed } = this.queries;

    if (!releaseClaimed) {
      return 0;
    }

    const staged = this.concurrency.takeStagedJobsToRelease();
    const active = includesActive ? this.concurrency.getActiveJobsToRelease() : [];
    const jobs = [...staged, ...active];

    if (jobs.length === 0) {
      return 0;
    }

    const releasedCount = await trySafe(
      async () => {
        const count = await releaseClaimed({ workerId: this.workerId, jobs });
        return typeof count === 'number' ? count : jobs.length;
      },
      (error) => {
        this.log.error('Failed to batch-release claimed jobs.');
        this.log.error(error);
      }
    );

    if (releasedCount === undefined) {
      for (const job of staged) {
        this.concurrency.stageForRelease(job);
      }

      return 0;
    }

    this.concurrency.markReleased(active);
    for (const job of jobs) {
      this.circuitBreaker.releaseProbe(job);
    }

    return releasedCount;
  }

  #isRunning(): boolean {
    return this.running;
  }

  async #runClaimCycle(): Promise<void> {
    try {
      await this.#claimNextBatch();
    } finally {
      this.claimInFlight = undefined;

      // A full worker keeps the pending wake until a job frees a slot.
      if (this.running && this.dirty && this.concurrency.inFlightCount < this.maxConcurrency) {
        this.wake();
      }
    }
  }

  async #claimNextBatch(): Promise<void> {
    if (!this.#isRunning()) {
      return;
    }

    this.dirty = false;

    const claimInput = this.concurrency.buildClaimDueInput({
      workerId: this.workerId,
      maxConcurrency: this.maxConcurrency,
      handlers: this.handlers,
      circuitBreaker: this.circuitBreaker,
      now: Date.now(),
    });

    if (!claimInput) {
      if (this.concurrency.inFlightCount >= this.maxConcurrency) {
        this.dirty = true;
      }
      return;
    }

    const claimedRows = await trySafe(
      async () => this.queries.claimDue(claimInput),
      (error) => {
        this.log.error('Failed to claim due jobs.');
        this.log.error(error);
      }
    );

    if (!claimedRows) {
      return;
    }

    if (!this.#isRunning()) {
      this.#stageLateClaimedRows(claimedRows);
      return;
    }

    this.#dispatchClaimedRows(claimedRows);
  }

  #stageLateClaimedRows(rows: readonly ClaimedJobRow[]): void {
    for (const row of rows) {
      this.concurrency.stageForRelease(row);
    }

    if (this.stopCompleted && rows.length > 0) {
      void this.#releaseJobs(false);
    }
  }

  #dispatchClaimedRows(rows: readonly ClaimedJobRow[]): void {
    const excessRows = rows.filter((row) => {
      const handler = this.handlers.get(row.type);

      if (!handler) {
        this.log.warn(`No handler registered for job type "${row.type}"; skipping job ${row.id}.`);
        return false;
      }

      if (
        handler.circuitBreaker &&
        this.circuitBreaker.tryAcquireProbe(row, Date.now()) === 'reject'
      ) {
        this.concurrency.stageForRelease(row);
        return true;
      }

      const execution = this.#executeJob(row, handler);
      this.concurrency.acquire(row, execution);
      return false;
    });

    if (excessRows.length > 0) {
      void this.#releaseJobs(false);
    }
  }

  async #executeJob(
    row: ClaimedJobRow,
    handler: RegisteredJobHandler<SettlementMeta>
  ): Promise<void> {
    const { shouldWake } = await runAndSettleJob({
      row,
      handler,
      workerId: this.workerId,
      queries: this.queries,
      circuitBreaker: this.circuitBreaker,
      log: this.log,
      getNow: Date.now,
    });

    this.circuitBreaker.releaseProbe(row);
    const unblockedCap = this.concurrency.release(row, {
      maxConcurrency: this.maxConcurrency,
      perTenantConcurrency: handler.limits?.perTenantConcurrency,
      perGroupConcurrency: handler.limits?.perGroupConcurrency,
    });

    if (this.#isRunning() && (unblockedCap || shouldWake || this.dirty || this.claimInFlight)) {
      this.wake();
    }
  }

  async #waitForInFlight(): Promise<void> {
    if (this.claimInFlight === undefined && this.concurrency.inFlightCount === 0) {
      return;
    }

    if (this.claimInFlight) {
      await this.claimInFlight;
    }

    await this.concurrency.waitForActive();
    await this.#waitForInFlight();
  }
}
