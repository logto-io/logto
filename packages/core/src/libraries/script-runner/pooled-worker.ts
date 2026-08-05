import { Worker } from 'node:worker_threads';

import { type ScriptEntry, type ScriptResult } from './types.js';
import {
  type ScriptFailure,
  type ScriptWorkerData,
  type ScriptWorkerRequest,
  type ScriptWorkerResponse,
} from './worker-protocol.js';

/** How long a worker with no in-flight runs is kept for reuse. */
const idleTtlMs = 30_000;
/** A worker stops accepting new runs after this many admissions, then drains and terminates. */
const maxInvocationsPerWorker = 1000;

type PooledWorkerOptions = {
  /** Absolute path of the built worker entry. */
  workerPath: string;
  script: string;
  entry: ScriptEntry;
  /**
   * V8 old space cap for the thread.
   *
   * `resourceLimits` are fixed at spawn, so a pooled worker keeps the budget of the run that
   * created it.
   *
   * It is a per-isolate constraint, and V8 lets the process-global `--max-old-space-size` override
   * it: a host started with that flag (directly or through `NODE_OPTIONS`) lets a script grow to
   * the process budget instead, and only then reports out of memory. The wall clock is the bound
   * that always holds.
   */
  memoryMb: number;
  /** Lets the pool drop its entry as soon as this worker stops accepting new runs. */
  unpool: (worker: PooledWorker) => void;
};

type PendingRun = {
  resolve: (result: ScriptResult) => void;
  deadline: NodeJS.Timeout;
};

/**
 * `starting` and `ready` accept new runs; `retired` serves only what is already in flight and dies
 * once it drains; `dead` is a one-shot latch.
 */
type PooledWorkerState = 'starting' | 'ready' | 'retired' | 'dead';

const disposedFailure: ScriptFailure = Object.freeze({
  ok: false,
  kind: 'runtime',
  name: 'Error',
  message: 'The script worker was shut down.',
});

const isOutOfMemoryError = (error: Error & { code?: string }) =>
  error.code === 'ERR_WORKER_OUT_OF_MEMORY';

/**
 * One worker thread bound to one script, serving any number of concurrent runs.
 *
 * Runs are multiplexed over a single thread and demultiplexed by `runId`, so the three worker
 * listeners are attached once and live as long as the thread does — attaching a listener per run
 * would leak one on every run the host terminates.
 *
 * A fault (deadline breach, out of memory, worker error, unexpected exit) is uniform: the worker
 * leaves the pool, every in-flight run settles with the same failure, and the thread is terminated.
 * Runs sharing a faulted worker are collateral, which is honest — by construction they are all
 * running the same script.
 */
export class PooledWorker {
  private readonly worker: Worker;
  /** Resolves once the script is evaluated, carrying the failure that stopped it if there was one. */
  // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- `Promise.withResolvers` is standard since ES2024; the rule's built-in method list predates it
  private readonly startup = Promise.withResolvers<{ failure?: ScriptFailure }>();
  private readonly pending = new Map<number, PendingRun>();
  private state: PooledWorkerState = 'starting';
  private runIdCounter = 0;
  private admissionCount = 0;
  private idleTimer: NodeJS.Timeout | undefined;

  constructor(private readonly options: PooledWorkerOptions) {
    this.worker = new Worker(options.workerPath, {
      workerData: { script: options.script, entry: options.entry } satisfies ScriptWorkerData,
      resourceLimits: { maxOldGenerationSizeMb: options.memoryMb },
      // `stdout` and `stderr` are deliberately left at their default `false`, which pipes the
      // worker's output through to the host process — the passthrough dry runs rely on.
    });

    /**
     * The per-run deadline is the only handle this class refs. The event loop therefore stays alive
     * exactly as long as a run is outstanding, and an idle or leaked worker can never hold the
     * process — or a test runner — open.
     *
     * Startup has no separate timer: `reserve(wallClockMs)` arms before the caller awaits ready, so
     * a worker that never signals still settles through the run deadline.
     */
    this.worker.unref();

    // All three are attached synchronously and for the worker's whole life. An unhandled `error`
    // event on a worker crashes the host process.
    this.worker.on('message', (response: ScriptWorkerResponse) => {
      this.onMessage(response);
    });
    this.worker.on('error', (error: Error & { code?: string }) => {
      this.fail(
        isOutOfMemoryError(error)
          ? { ok: false, kind: 'oom' }
          : {
              ok: false,
              kind: 'runtime',
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
      );
    });
    this.worker.on('exit', (code: number) => {
      // A settle path of its own: a script calling `process.exit()` emits `exit` with no preceding
      // `error`, and without this the caller would await forever.
      this.fail({
        ok: false,
        kind: 'runtime',
        name: 'Error',
        message: `The script worker exited unexpectedly with code ${code}.`,
      });
    });
  }

  /** Whether the pool may hand this worker a new run. */
  get isUsable(): boolean {
    return this.state === 'starting' || this.state === 'ready';
  }

  /**
   * Claim a slot and arm the run's deadline.
   *
   * Synchronous on purpose: the caller reserves before it awaits anything, so the deadline covers
   * startup as well as the run itself, which is what `ScriptLimits.wallClockMs` promises.
   */
  reserve(wallClockMs: number): { runId: number; promise: Promise<ScriptResult> } {
    this.clearIdleTimer();
    this.runIdCounter += 1;

    const runId = this.runIdCounter;
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- `Promise.withResolvers` is standard since ES2024; the rule's built-in method list predates it
    const { promise, resolve } = Promise.withResolvers<ScriptResult>();
    const deadline = setTimeout(() => {
      this.fail({ ok: false, kind: 'timeout' });
    }, wallClockMs);

    this.pending.set(runId, { resolve, deadline });
    this.admissionCount += 1;

    // Retire only once the run is registered, otherwise the worker would look drained and die.
    if (this.admissionCount >= maxInvocationsPerWorker) {
      this.retire();
    }

    return { runId, promise };
  }

  /** Hand the reserved run to the worker and await its outcome. */
  async execute(
    runId: number,
    promise: Promise<ScriptResult>,
    payload: Record<string, unknown>
  ): Promise<ScriptResult> {
    const { failure } = await this.startup.promise;

    // A startup failure or an expired deadline has already settled this run.
    if (!failure && this.pending.has(runId)) {
      try {
        this.worker.postMessage({ runId, payload } satisfies ScriptWorkerRequest);
      } catch (error: unknown) {
        // Nothing was enqueued, so the worker is untouched and stays pooled.
        this.settle(runId, {
          ok: false,
          kind: 'type',
          message: `The script payload cannot be transferred to the worker thread: ${String(
            error
          )}`,
        });
      }
    }

    return promise;
  }

  /** Stop accepting new runs, then die once the in-flight ones settle. */
  retire(): void {
    if (this.state === 'dead') {
      return;
    }

    this.state = 'retired';
    this.onSettled();
  }

  /** Terminate the thread and settle every in-flight run. */
  async dispose(): Promise<void> {
    this.kill();
    this.startup.resolve({ failure: disposedFailure });

    // Snapshot: `settle` deletes from `pending` as the loop walks it.
    const disposedRunIds = [...this.pending.keys()];

    for (const runId of disposedRunIds) {
      this.settle(runId, disposedFailure);
    }

    /**
     * The listeners stay attached deliberately. `terminate()` is asynchronous, so a script that is
     * allocating hard can still breach its heap limit afterwards, and Node reports that by emitting
     * `error` on the worker — with no listener that is an unhandled `error` event, which takes the
     * host process down. They cost nothing to keep: `kill()` has already latched the state to
     * `dead`, so both handlers no-op, and Node drops them itself once the thread is gone.
     */
    await this.worker.terminate();
  }

  private onMessage(response: ScriptWorkerResponse): void {
    if (response.type === 'result') {
      this.settle(response.runId, response.result);
      return;
    }

    if (response.type === 'startup-failed') {
      this.fail(response.failure);
      return;
    }

    if (this.state === 'starting') {
      this.state = 'ready';
    }

    this.startup.resolve({});
  }

  private settle(runId: number, result: ScriptResult): void {
    const run = this.pending.get(runId);

    // Unknown or already settled — a late message after a fault, or a second settle attempt.
    if (!run) {
      return;
    }

    // Delete before resolving so settle-once holds by construction.
    this.pending.delete(runId);
    clearTimeout(run.deadline);
    run.resolve(result);
    this.onSettled();
  }

  private onSettled(): void {
    if (this.pending.size > 0 || this.state === 'dead') {
      return;
    }

    this.clearIdleTimer();

    if (this.state === 'retired') {
      this.kill();
      return;
    }

    this.idleTimer = setTimeout(() => {
      this.kill();
    }, idleTtlMs);
    this.idleTimer.unref();
  }

  private fail(result: ScriptFailure): void {
    if (this.state === 'dead') {
      return;
    }

    this.kill();
    // A no-op when startup already resolved; the run settles below either way.
    this.startup.resolve({ failure: result });

    // Snapshot: `settle` deletes from `pending` as the loop walks it.
    const failedRunIds = [...this.pending.keys()];

    for (const runId of failedRunIds) {
      this.settle(runId, result);
    }
  }

  private kill(): void {
    this.state = 'dead';
    this.clearIdleTimer();
    this.options.unpool(this);
    void this.worker.terminate();
  }

  private clearIdleTimer(): void {
    clearTimeout(this.idleTimer);
  }
}
