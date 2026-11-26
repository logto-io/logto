import { appInsights } from '@logto/app-insights/node';
import { JobQueueWorker } from '@logto/job-queue';
import { ConsoleLog } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import type { CommonQueryMethods } from '@silverhand/slonik';
import chalk from 'chalk';

import {
  type CoreJobSettlementMeta,
  createJobQueueQueries,
  type JobQueueGauges,
} from '#src/queries/job-queue.js';

import {
  WaitingRowCapCache,
  type WaitingRowCapCheckInput,
  type WaitingRowCapScope,
  type WaitingRowReservation,
} from './waiting-row-cap-cache.js';
import { buildExpiredWebhookLog, createWebhookJobHandler } from './webhook-handler.js';

const jobQueueMetricsIntervalMs = 60_000;
const maxConcurrentJobsPerInstance = 100;

export const jobQueueMetricNames = Object.freeze({
  depth: 'job_queue.depth',
  oldestWaitingAgeMs: 'job_queue.oldest_waiting_age_ms',
  openCircuits: 'job_queue.open_circuits',
  failedEnqueues: 'job_queue.failed_enqueues',
  exhaustedDeliveries: 'job_queue.exhausted_deliveries',
  droppedAtGroupCap: 'job_queue.dropped_at_group_cap',
  droppedAtTenantCap: 'job_queue.dropped_at_tenant_cap',
} as const);

const consoleLog = new ConsoleLog(chalk.magenta('job-queue'));

type CoreJobQueueOptions = {
  waitingRowCapCache?: WaitingRowCapCache;
};

/**
 * The process-wide job queue: one worker per Core instance over `EnvSet.sharedPool`, the
 * enqueues still in flight, and the queue metrics.
 */
export class CoreJobQueue {
  #worker?: JobQueueWorker<CoreJobSettlementMeta>;
  #metricsTimer?: NodeJS.Timeout;
  #failedEnqueues = 0;
  #exhaustedDeliveries = 0;
  #droppedAtGroupCap = 0;
  #droppedAtTenantCap = 0;
  readonly #waitingRowCapCache: WaitingRowCapCache;
  readonly #pendingEnqueues = new Set<Promise<void>>();

  constructor(options?: CoreJobQueueOptions) {
    this.#waitingRowCapCache = options?.waitingRowCapCache ?? new WaitingRowCapCache();
  }

  get worker(): JobQueueWorker<CoreJobSettlementMeta> | undefined {
    return this.#worker;
  }

  /** Start claiming due jobs and reporting metrics. Handlers registered later are picked up. */
  start(pool: CommonQueryMethods): JobQueueWorker<CoreJobSettlementMeta> {
    if (this.#worker) {
      return this.#worker;
    }

    const queries = createJobQueueQueries(pool, {
      buildExpiredLog: buildExpiredWebhookLog,
      onBulkExpired: (count) => {
        this.recordExhaustedDeliveries(count);
      },
    });
    const worker = new JobQueueWorker<CoreJobSettlementMeta>(queries, {
      log: consoleLog,
      maxConcurrency: maxConcurrentJobsPerInstance,
    });
    worker.register(
      createWebhookJobHandler(queries, {
        onExhausted: () => {
          this.recordExhaustedDeliveries();
        },
      })
    );

    this.#worker = worker;
    worker.start();

    this.#metricsTimer = setInterval(() => {
      void this.reportMetrics(queries.getGauges);
    }, jobQueueMetricsIntervalMs);
    this.#metricsTimer.unref();

    return worker;
  }

  /** Log and count an enqueue failure (either a pre-insert lookup or the insert itself). */
  recordFailedEnqueue(error: unknown): void {
    this.#failedEnqueues += 1;
    consoleLog.error('Failed to enqueue job.');
    consoleLog.error(error);
  }

  /** Count deliveries that permanently exhausted their retry window. */
  recordExhaustedDeliveries(count = 1): void {
    this.#exhaustedDeliveries += count;
  }

  /** Count deliveries dropped because the per-group or per-tenant waiting-row cap was reached. */
  recordDroppedAtCap(scope: WaitingRowCapScope, count = 1): void {
    if (scope === 'group') {
      this.#droppedAtGroupCap += count;
      return;
    }

    this.#droppedAtTenantCap += count;
  }

  /** Check per-group and per-tenant waiting-row caps and reserve a cached slot if below both. */
  async tryReserveWaitingRow(input: WaitingRowCapCheckInput): Promise<WaitingRowReservation> {
    return this.#waitingRowCapCache.tryReserve(input);
  }

  /** Wake the local worker after an enqueue commits. */
  wake(): void {
    this.#worker?.wake();
  }

  /**
   * Track an async enqueue workflow in `#pendingEnqueues` synchronously before its first `await`,
   * so graceful shutdown waits for pre-insert lookups as well as the `jobs` insert itself.
   */
  async trackEnqueue(task: () => Promise<void>): Promise<void> {
    const pending = (async () => {
      try {
        await task();
      } catch (error: unknown) {
        this.recordFailedEnqueue(error);
      }
    })();

    this.#pendingEnqueues.add(pending);

    try {
      await pending;
    } finally {
      this.#pendingEnqueues.delete(pending);
    }
  }

  /**
   * Stop claiming and wait for in-flight jobs, then release what is still claimed. Enqueues are
   * awaited once `serversClosed` settles, since requests still running can start new ones.
   */
  async drain(serversClosed?: Promise<unknown>): Promise<void> {
    clearInterval(this.#metricsTimer);
    await Promise.all([
      this.#worker?.stop(),
      (async () => {
        await Promise.allSettled([serversClosed]);

        while (this.#pendingEnqueues.size > 0) {
          // eslint-disable-next-line no-await-in-loop -- an awaited enqueue can start another
          await Promise.allSettled(this.#pendingEnqueues);
        }
      })(),
    ]);
  }

  /** Hand rows still claimed by this worker back to the queue, such as after a drain timeout. */
  async releaseClaimed(): Promise<void> {
    await this.#worker?.releaseClaimed();
  }

  async reportMetrics(getGauges: () => Promise<JobQueueGauges>): Promise<void> {
    const gauges = await trySafe(getGauges, (error) => {
      consoleLog.error('Failed to read job queue gauges.');
      consoleLog.error(error);
    });

    const failedEnqueues = this.#failedEnqueues;
    this.#failedEnqueues = 0;
    const exhaustedDeliveries = this.#exhaustedDeliveries;
    this.#exhaustedDeliveries = 0;
    const droppedAtGroupCap = this.#droppedAtGroupCap;
    this.#droppedAtGroupCap = 0;
    const droppedAtTenantCap = this.#droppedAtTenantCap;
    this.#droppedAtTenantCap = 0;

    const metrics: Record<string, number> = {
      ...(gauges && {
        [jobQueueMetricNames.depth]: gauges.depth,
        [jobQueueMetricNames.oldestWaitingAgeMs]: gauges.oldestWaitingAgeMs,
      }),
      [jobQueueMetricNames.openCircuits]: this.#worker?.openCircuitCount ?? 0,
      [jobQueueMetricNames.failedEnqueues]: failedEnqueues,
      [jobQueueMetricNames.exhaustedDeliveries]: exhaustedDeliveries,
      [jobQueueMetricNames.droppedAtGroupCap]: droppedAtGroupCap,
      [jobQueueMetricNames.droppedAtTenantCap]: droppedAtTenantCap,
    };

    const { client } = appInsights;

    if (!client) {
      consoleLog.info('Job queue metrics:', metrics);
      return;
    }

    for (const [name, value] of Object.entries(metrics)) {
      trySafe(() => {
        client.trackMetric({ name, value });
      });
    }
  }
}

export const jobQueue = new CoreJobQueue();
