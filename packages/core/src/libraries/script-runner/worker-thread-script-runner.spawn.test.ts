import EventEmitter from 'node:events';

import { type ScriptRunInput } from './types.js';
import {
  type ScriptWorkerData,
  type ScriptWorkerRequest,
  type ScriptWorkerResponse,
} from './worker-protocol.js';

const { jest } = import.meta;

/**
 * A stand-in worker thread that records how it was spawned and lets each test script its fate.
 *
 * The real thing cannot pin two contracts: `resourceLimits` is invisible from inside a worker once
 * the jest process's `--max_old_space_size` overrides it, and a real out-of-memory kill would race
 * a multi-gigabyte allocation against the wall clock for the same reason. Faking the thread makes
 * both deterministic — at the cost of not exercising the worker entry, which every sibling suite
 * does with real threads.
 */
// eslint-disable-next-line unicorn/prefer-event-target -- the real `Worker` is an EventEmitter, and the code under test uses its `on` API
class FakeWorker extends EventEmitter {
  readonly requests: ScriptWorkerRequest[] = [];

  constructor(
    readonly workerPath: string,
    readonly options: { workerData: ScriptWorkerData; resourceLimits: Record<string, number> }
  ) {
    super();
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- test bookkeeping
    spawnedWorkers.push(this);
    queueMicrotask(() => {
      this.emit('message', { type: 'ready' } satisfies ScriptWorkerResponse);
    });
  }

  postMessage(request: ScriptWorkerRequest): void {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- test bookkeeping
    this.requests.push(request);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- only the real worker holds the event loop
  unref(): void {}

  async terminate(): Promise<number> {
    return 0;
  }

  /** Settle the most recent run this worker was handed. */
  succeedLast(value: unknown): void {
    const request = this.requests.at(-1);

    if (!request) {
      throw new Error('No request has reached this worker yet.');
    }

    this.emit('message', {
      type: 'result',
      runId: request.runId,
      result: { ok: true, value },
    } satisfies ScriptWorkerResponse);
  }
}

const spawnedWorkers: FakeWorker[] = [];

jest.unstable_mockModule('node:worker_threads', () => ({
  Worker: FakeWorker,
}));

const { WorkerThreadScriptRunner } = await import('./worker-thread-script-runner.js');

const buildInput = (script: string, memoryMb: number): ScriptRunInput => ({
  script,
  entry: 'runAction',
  payload: {},
  limits: { wallClockMs: 2000, memoryMb },
  egress: { mode: 'allowAll' },
});

/** Poll until the runner's asynchronous spawn work has produced the expected state. */
const waitFor = async (predicate: () => boolean, remainingMs = 1000): Promise<void> => {
  if (predicate()) {
    return;
  }

  if (remainingMs <= 0) {
    throw new Error('Timed out waiting for the runner to reach the expected state.');
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 5);
  });

  return waitFor(predicate, remainingMs - 5);
};

describe('WorkerThreadScriptRunner spawn contract', () => {
  const runners: Array<InstanceType<typeof WorkerThreadScriptRunner>> = [];

  const createRunner = () => {
    const runner = new WorkerThreadScriptRunner();

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- test bookkeeping for teardown
    runners.push(runner);

    return runner;
  };

  afterEach(async () => {
    await Promise.all(runners.map(async (runner) => runner.dispose()));
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- test bookkeeping for teardown
    runners.splice(0, runners.length);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- test bookkeeping for teardown
    spawnedWorkers.splice(0, spawnedWorkers.length);
  });

  // The jest process's own `--max_old_space_size` makes the limit unobservable from inside a real
  // worker, so this is the assertion that keeps `limits.memoryMb` plumbed into the spawn at all.
  it('spawns the worker with the script, entry and memory budget of the run', async () => {
    const runner = createRunner();
    const promise = runner.run(buildInput('worker-source', 64));

    await waitFor(() => spawnedWorkers[0]?.requests.length === 1);
    spawnedWorkers[0]?.succeedLast({ done: true });

    await expect(promise).resolves.toEqual({ ok: true, value: { done: true } });
    expect(spawnedWorkers).toHaveLength(1);
    expect(spawnedWorkers[0]?.options).toEqual({
      workerData: { script: 'worker-source', entry: 'runAction' },
      resourceLimits: { maxOldGenerationSizeMb: 64 },
    });
  });

  it('maps an out-of-memory kill to oom and serves the next run on a fresh worker', async () => {
    const runner = createRunner();
    const first = runner.run(buildInput('worker-source', 64));

    await waitFor(() => spawnedWorkers[0]?.requests.length === 1);
    // What Node emits when the worker breaches `maxOldGenerationSizeMb`.
    const oomError = new Error('Worker terminated due to reaching memory limit');
    Reflect.set(oomError, 'code', 'ERR_WORKER_OUT_OF_MEMORY');
    spawnedWorkers[0]?.emit('error', oomError);

    await expect(first).resolves.toEqual({ ok: false, kind: 'oom' });
    // The faulted worker left the pool rather than lingering as a corpse the next run would await.
    expect(runner.size).toBe(0);

    const second = runner.run(buildInput('worker-source', 64));

    await waitFor(() => spawnedWorkers[1]?.requests.length === 1);
    spawnedWorkers[1]?.succeedLast({ fresh: true });

    await expect(second).resolves.toEqual({ ok: true, value: { fresh: true } });
    expect(spawnedWorkers).toHaveLength(2);
  });

  // `resourceLimits` are fixed at spawn, so a pooled worker keeps the budget of the run that
  // created it — documented on `PooledWorkerOptions.memoryMb`.
  it('keeps the memory budget of the run that spawned the worker', async () => {
    const runner = createRunner();
    const first = runner.run(buildInput('worker-source', 64));

    await waitFor(() => spawnedWorkers[0]?.requests.length === 1);
    spawnedWorkers[0]?.succeedLast({});
    await first;

    const second = runner.run(buildInput('worker-source', 256));

    await waitFor(() => spawnedWorkers[0]?.requests.length === 2);
    spawnedWorkers[0]?.succeedLast({});
    await second;

    expect(spawnedWorkers).toHaveLength(1);
    expect(spawnedWorkers[0]?.options.resourceLimits).toEqual({ maxOldGenerationSizeMb: 64 });
  });
});
