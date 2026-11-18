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
import { withTimeout } from './promise.js';
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
  /** Clock provider for deterministic testing (default: `Date.now`). */
  now?: () => number;
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
  private readonly now: () => number;
  private readonly handlers = new Map<string, RegisteredJobHandler<SettlementMeta>>();
  private readonly concurrency = new ConcurrencyTracker();
  private readonly circuitBreaker = new GroupCircuitBreakerTracker();

  private running = false;
  private stopCompleted = false;
  private dirty = false;
  private timer?: NodeJS.Timeout;
  private claimInFlight?: Promise<void>;

  constructor(
    private readonly queries: JobQueueQueries<SettlementMeta>,
    options?: JobQueueWorkerOptions
  ) {
    // Must stay <= 21 chars to match `jobs.claimed_by varchar(21)`; never use `process.pid`.
    this.workerId = options?.workerId ?? generateStandardId();
    this.maxConcurrency = options?.maxConcurrency ?? defaultMaxConcurrency;
    this.pollIntervalMs = options?.pollIntervalMs ?? defaultPollIntervalMs;
    this.log = options?.log ?? new ConsoleLog(chalk.magenta('job-queue'));
    this.now = options?.now ?? Date.now;
  }

  get inFlightCount(): number {
    return this.concurrency.inFlightCount;
  }

  get openCircuitCount(): number {
    return this.circuitBreaker.getOpenCount(this.now());
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

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    this.claimInFlight = this.#runClaimCycle();
  }

  /**
   * Stop claiming new jobs, optionally drain in-flight work up to `drainTimeoutMs`, and release
   * any remaining claimed jobs in one batch.
   */
  async stop(options?: {
    drainTimeoutMs?: number;
  }): Promise<{ drained: boolean; releasedCount: number }> {
    this.running = false;
    this.dirty = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    const drain = async (): Promise<boolean> => {
      await this.#waitForInFlight();
      return true;
    };

    const drained =
      options?.drainTimeoutMs === undefined
        ? await drain()
        : ((await trySafe(
            withTimeout(drain(), options.drainTimeoutMs, 'Job queue worker drain timed out.')
          )) ?? false);

    this.stopCompleted = true;
    const releasedCount = await this.releaseClaimed();

    return { drained, releasedCount };
  }

  /** Batch-release all currently tracked unreleased claimed jobs for this worker. */
  async releaseClaimed(): Promise<number> {
    return this.#releaseJobs(this.concurrency.takeJobsToRelease());
  }

  async #releaseStagedRows(): Promise<number> {
    return this.#releaseJobs(this.concurrency.takeStagedJobsToRelease());
  }

  async #releaseJobs(jobs: readonly ClaimedJobRow[]): Promise<number> {
    for (const job of jobs) {
      this.circuitBreaker.releaseProbe(job);
    }

    if (jobs.length === 0 || !this.queries.releaseClaimed) {
      return jobs.length;
    }

    const { releaseClaimed } = this.queries;

    await trySafe(
      async () => releaseClaimed({ workerId: this.workerId, jobs }),
      (error) => {
        this.log.error('Failed to batch-release claimed jobs.');
        this.log.error(error);
      }
    );

    return jobs.length;
  }

  #isRunning(): boolean {
    return this.running;
  }

  #isDirty(): boolean {
    return this.dirty;
  }

  async #runClaimCycle(): Promise<void> {
    try {
      await this.#claimNextBatch();
    } finally {
      this.claimInFlight = undefined;
      this.#schedulePoll();
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
      now: this.now(),
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

    if (this.#isDirty() && this.concurrency.inFlightCount < this.maxConcurrency) {
      await this.#claimNextBatch();
    }
  }

  #stageLateClaimedRows(rows: readonly ClaimedJobRow[]): void {
    for (const row of rows) {
      this.concurrency.stageForRelease(row);
    }

    if (this.stopCompleted && rows.length > 0) {
      void this.#releaseStagedRows();
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
        this.circuitBreaker.tryAcquireProbe(row, this.now()) === 'reject'
      ) {
        this.concurrency.stageForRelease(row);
        return true;
      }

      const execution = this.#executeJob(row, handler);
      this.concurrency.acquire(row, execution);
      return false;
    });

    if (excessRows.length > 0) {
      void this.#releaseStagedRows();
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
      getNow: this.now,
    });

    this.circuitBreaker.releaseProbe(row);
    const { unblockedCap } = this.concurrency.release(row, {
      maxConcurrency: this.maxConcurrency,
      perTenantConcurrency: handler.limits?.perTenantConcurrency,
      perGroupConcurrency: handler.limits?.perGroupConcurrency,
    });

    if (this.#isRunning() && (unblockedCap || shouldWake || this.dirty)) {
      this.wake();
    }
  }

  #schedulePoll(): void {
    if (!this.running || this.timer) {
      return;
    }

    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.wake();
    }, this.pollIntervalMs);
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
