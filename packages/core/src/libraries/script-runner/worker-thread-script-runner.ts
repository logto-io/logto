import { createHash } from 'node:crypto';
import path from 'node:path';

import { packageDirectory } from 'pkg-dir';

import { PooledWorker } from './pooled-worker.js';
import {
  type ScriptEntry,
  type ScriptResult,
  type ScriptRunInput,
  type ScriptRunner,
} from './types.js';

/**
 * Both builds emit the worker entry here: the bundler's output base and the type compiler's
 * inferred root both resolve `src/workers/tasks/*` to this path, unhashed.
 */
const workerBuildPath = 'build/workers/tasks/script-runner.js';

/**
 * Hard ceiling on pooled workers, enforced rather than emergent: the pool key includes a script
 * hash, and the dry run routes accept an arbitrary script per request.
 *
 * Total script heap is bounded by `maxWorkers * limits.memoryMb`, plus a transient tail of
 * evicted workers still draining runs that are each wall clock bounded.
 */
const maxWorkers = 4;

const resolveWorkerPath = async () => {
  const rootDirectory = await packageDirectory();

  if (!rootDirectory) {
    throw new Error('Cannot find the root directory of the package');
  }

  return path.join(rootDirectory, workerBuildPath);
};

/**
 * Runs user-authored scripts on pooled worker threads.
 *
 * The thread is what makes a runaway script survivable: a host-side deadline plus `terminate()` is
 * the only bound that holds against a promise that never settles, and `resourceLimits` keeps a
 * runaway allocation from taking the host's heap with it. It is not an isolation boundary — a
 * script still runs with the host's privileges.
 *
 * Workers are keyed by `{keyPrefix}:{entry}:{memoryMb}:{sha256(script)}`, so a script is compiled
 * once and its worker is reused across runs, while runs with different key prefixes (e.g.
 * different tenants) never share a worker even for a byte-identical script. The memory budget is
 * part of the key because `resourceLimits` are fixed at spawn: keying on it is what guarantees a
 * run is never served by a worker with a stricter or looser limit than it asked for. Recycling
 * happens on fault, on idle expiry, and after a fixed number of runs.
 */
export class WorkerThreadScriptRunner implements ScriptRunner {
  /** Insertion-ordered, which makes the first entry the least recently used. */
  private readonly pool = new Map<string, PooledWorker>();
  /**
   * Every worker with a live thread, including those already dropped from the pool.
   *
   * Eviction and recycling take a worker out of the pool while it drains its in-flight runs, so the
   * pool alone is not enough to shut everything down.
   */
  private readonly liveWorkers = new Set<PooledWorker>();
  /**
   * Resolved lazily on the first run rather than at construction: a construction-time promise that
   * rejects before anyone awaits it is an unhandled rejection, which can take the process down for
   * a runner that never served a script.
   */
  private workerPath: Promise<string> | undefined;

  /** Live pooled workers. Exposed for tests. */
  get size(): number {
    return this.pool.size;
  }

  /**
   * Run a script and report its outcome as a value.
   *
   * Rejects only for host-side defects that no script can cause: an egress policy this runner
   * cannot enforce (a caller bug) or a worker entry whose build output cannot be resolved (a
   * deployment bug). Every script failure comes back as a {@link ScriptResult}.
   */
  async run({
    script,
    entry,
    payload,
    limits,
    egress,
    keyPrefix,
  }: ScriptRunInput): Promise<ScriptResult> {
    if (egress.mode !== 'allowAll') {
      // A worker thread reaches `fetch`, `node:http` and `node:net` unimpeded. Accepting the policy
      // and running the script anyway would be a lie about what was enforced.
      throw new TypeError(
        `The worker thread script runner cannot enforce the \`${egress.mode}\` egress policy.`
      );
    }

    // The only `await` before the synchronous region below. A rejection here is memoized, so
    // every run against a broken build fails the same way instead of retrying the resolution.
    this.workerPath ||= resolveWorkerPath();
    const workerPath = await this.workerPath;
    const key = this.buildKey(keyPrefix, entry, limits.memoryMb, script);

    /**
     * Synchronous through `reserve()`: Node runs it without suspension, so two concurrent misses on
     * a cold key cannot both spawn a worker.
     */
    const worker = this.acquire(key, { workerPath, script, entry, memoryMb: limits.memoryMb });
    const { runId, promise } = worker.reserve(limits.wallClockMs);

    return worker.execute(runId, promise, payload);
  }

  /** Terminate every live worker and settle the runs they were serving. */
  async dispose(): Promise<void> {
    const workers = [...this.liveWorkers];

    this.pool.clear();
    this.liveWorkers.clear();

    await Promise.all(workers.map(async (worker) => worker.dispose()));
  }

  /**
   * The key prefix leads and the fixed-length hash trails, so a prefix containing `:` can never
   * collide with another prefix/entry combination.
   */
  private buildKey(
    keyPrefix: string | undefined,
    entry: ScriptEntry,
    memoryMb: number,
    script: string
  ): string {
    const hash = createHash('sha256').update(script).digest('hex');

    return `${keyPrefix ?? ''}:${entry}:${memoryMb}:${hash}`;
  }

  /** Must never contain an `await` — see the synchronous region in {@link run}. */
  private acquire(
    key: string,
    spawn: { workerPath: string; script: string; entry: ScriptEntry; memoryMb: number }
  ): PooledWorker {
    const existing = this.pool.get(key);

    if (existing?.isUsable) {
      // Re-insert to refresh the least-recently-used ordering.
      this.pool.delete(key);
      this.pool.set(key, existing);

      return existing;
    }

    if (existing) {
      this.pool.delete(key);
    }

    if (this.pool.size >= maxWorkers) {
      this.evictLeastRecentlyUsed();
    }

    const pooled = new PooledWorker({
      ...spawn,
      unpool: (worker) => {
        this.unpool(key, worker);
      },
    });

    this.liveWorkers.add(pooled);
    this.pool.set(key, pooled);

    return pooled;
  }

  private evictLeastRecentlyUsed(): void {
    const [oldest] = [...this.pool.entries()];

    if (!oldest) {
      return;
    }

    const [oldestKey, oldestWorker] = oldest;

    this.pool.delete(oldestKey);
    // Reaching the cap is a capacity decision, not a fault: in-flight runs finish first.
    oldestWorker.retire();
  }

  /**
   * Called once a worker's thread is gone.
   *
   * The pool removal is identity-guarded so a late fault never evicts the worker that replaced it;
   * dropping it from {@link liveWorkers} is not, since a dead worker is never anyone's replacement.
   */
  private unpool(key: string, worker: PooledWorker): void {
    this.liveWorkers.delete(worker);

    if (this.pool.get(key) === worker) {
      this.pool.delete(key);
    }
  }
}
