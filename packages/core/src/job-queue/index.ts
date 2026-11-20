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

import { createWebhookJobHandler } from './webhook-handler.js';

const jobQueueMetricsIntervalMs = 60_000;
const maxConcurrentJobsPerInstance = 100;

export const jobQueueMetricNames = Object.freeze({
  depth: 'job_queue.depth',
  oldestWaitingAgeMs: 'job_queue.oldest_waiting_age_ms',
  failedEnqueues: 'job_queue.failed_enqueues',
} as const);

const consoleLog = new ConsoleLog(chalk.magenta('job-queue'));

/**
 * The process-wide job queue: one worker per Core instance over `EnvSet.sharedPool`, the
 * enqueues still in flight, and the queue metrics.
 */
export class CoreJobQueue {
  #worker?: JobQueueWorker<CoreJobSettlementMeta>;
  #metricsTimer?: NodeJS.Timeout;
  #failedEnqueues = 0;
  readonly #pendingEnqueues = new Set<Promise<void>>();

  get worker(): JobQueueWorker<CoreJobSettlementMeta> | undefined {
    return this.#worker;
  }

  /** Start claiming due jobs and reporting metrics. Handlers registered later are picked up. */
  start(pool: CommonQueryMethods): JobQueueWorker<CoreJobSettlementMeta> {
    if (this.#worker) {
      return this.#worker;
    }

    const queries = createJobQueueQueries(pool);
    const worker = new JobQueueWorker<CoreJobSettlementMeta>(queries, {
      log: consoleLog,
      maxConcurrency: maxConcurrentJobsPerInstance,
    });
    worker.register(createWebhookJobHandler(queries));

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
   * Run a fire-and-forget insert into `jobs`. Shutdown waits for it before closing pools, and a
   * failure is logged and counted instead of thrown. Wakes the local worker once the row exists.
   */
  async enqueue(insert: () => Promise<unknown>): Promise<void> {
    return this.trackEnqueue(async () => {
      await insert();
      this.#worker?.wake();
    });
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

    const metrics: Record<string, number> = {
      ...(gauges && {
        [jobQueueMetricNames.depth]: gauges.depth,
        [jobQueueMetricNames.oldestWaitingAgeMs]: gauges.oldestWaitingAgeMs,
      }),
      [jobQueueMetricNames.failedEnqueues]: failedEnqueues,
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
