import { type ScriptEntry, type ScriptRunInput } from './types.js';
import { WorkerThreadScriptRunner } from './worker-thread-script-runner.js';

/**
 * A script whose top-level state survives between runs, which makes worker reuse observable: a
 * fresh worker answers `1`, a reused one counts up from there.
 */
const counterScript = (marker = 'default') =>
  `var count = 0;
   const runAction = () => ({ marker: '${marker}', count: ++count });
   const getCustomJwtClaims = runAction;`;

const buildInput = (
  script: string,
  entry: ScriptEntry = 'runAction',
  payload: Record<string, unknown> = {}
): ScriptRunInput => ({
  script,
  entry,
  payload,
  limits: { wallClockMs: 2000, memoryMb: 64 },
  egress: { mode: 'allowAll' },
});

/** Keep in sync with `maxWorkers` in `worker-thread-script-runner.ts`. */
const maxWorkers = 4;
/** Keep in sync with `maxInvocationsPerWorker` in `pooled-worker.ts`. */
const maxInvocationsPerWorker = 1000;

describe('WorkerThreadScriptRunner pooling', () => {
  const runners: WorkerThreadScriptRunner[] = [];

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
  });

  it('reuses one worker for the same script', async () => {
    const runner = createRunner();
    const input = buildInput(counterScript());

    await expect(runner.run(input)).resolves.toMatchObject({ value: { count: 1 } });
    await expect(runner.run(input)).resolves.toMatchObject({ value: { count: 2 } });
    expect(runner.size).toBe(1);
  });

  it('does not share a worker between different scripts', async () => {
    const runner = createRunner();

    await expect(runner.run(buildInput(counterScript('a')))).resolves.toMatchObject({
      value: { marker: 'a', count: 1 },
    });
    await expect(runner.run(buildInput(counterScript('b')))).resolves.toMatchObject({
      value: { marker: 'b', count: 1 },
    });
    expect(runner.size).toBe(2);
  });

  it('does not share a worker between different entries', async () => {
    const runner = createRunner();
    const script = counterScript();

    await expect(runner.run(buildInput(script, 'runAction'))).resolves.toMatchObject({
      value: { count: 1 },
    });
    await expect(runner.run(buildInput(script, 'getCustomJwtClaims'))).resolves.toMatchObject({
      value: { count: 1 },
    });
    expect(runner.size).toBe(2);
  });

  it('gives each concurrent run its own result', async () => {
    const runner = createRunner();
    const script = 'const runAction = ({ index }) => ({ doubled: index * 2 });';
    const results = await Promise.all(
      Array.from({ length: 20 }, async (_, index) =>
        runner.run(buildInput(script, 'runAction', { index }))
      )
    );

    expect(results).toEqual(
      Array.from({ length: 20 }, (_, index) => ({ ok: true, value: { doubled: index * 2 } }))
    );
    expect(runner.size).toBe(1);
  });

  // Guards the invariant that acquiring and reserving is free of `await`, so concurrent misses on a
  // cold key cannot each spawn a worker.
  it('spawns a single worker for concurrent misses on a cold key', async () => {
    const runner = createRunner();
    const input = buildInput(counterScript());
    const results = await Promise.all(Array.from({ length: 30 }, async () => runner.run(input)));
    const counts = results.map((result) =>
      result.ok &&
      typeof result.value === 'object' &&
      result.value !== null &&
      'count' in result.value
        ? result.value.count
        : undefined
    );

    expect(new Set(counts).size).toBe(30);
    expect(runner.size).toBe(1);
  }, 15_000);

  // Recycling after a fixed number of runs bounds how much state — and how much leaked memory — a
  // long-lived script can accumulate on one thread.
  it('retires a worker after its invocation budget and starts the next run fresh', async () => {
    const runner = createRunner();
    const input = {
      ...buildInput(counterScript()),
      // One worker serves every run sequentially, so the deadline must cover the whole queue.
      limits: { wallClockMs: 30_000, memoryMb: 64 },
    };
    const results = await Promise.all(
      Array.from({ length: maxInvocationsPerWorker }, async () => runner.run(input))
    );
    const counts = results.map((result) =>
      result.ok &&
      typeof result.value === 'object' &&
      result.value !== null &&
      'count' in result.value
        ? result.value.count
        : undefined
    );

    // Every admission was served by the same worker: one counter, no duplicates.
    expect(new Set(counts).size).toBe(maxInvocationsPerWorker);
    // The budget was exhausted, so the worker retired and left the pool once it drained.
    expect(runner.size).toBe(0);
    // The next run starts a fresh counter on a fresh worker.
    await expect(runner.run(buildInput(counterScript()))).resolves.toMatchObject({
      value: { count: 1 },
    });
  }, 60_000);

  it('evicts the least recently used worker at the cap', async () => {
    const runner = createRunner();
    const markers = Array.from({ length: maxWorkers }, (_, index) => `worker-${index}`);

    for (const marker of markers) {
      // eslint-disable-next-line no-await-in-loop -- fill the pool in LRU insertion order
      await runner.run(buildInput(counterScript(marker)));
    }

    expect(runner.size).toBe(maxWorkers);

    await runner.run(buildInput(counterScript('overflow')));
    expect(runner.size).toBe(maxWorkers);

    // The first fill entry was evicted, so it starts counting over.
    await expect(runner.run(buildInput(counterScript(markers[0])))).resolves.toMatchObject({
      value: { marker: markers[0], count: 1 },
    });
  });

  // Reaching the cap is a capacity decision, not a fault, so an evicted worker drains first.
  it('finishes the run in flight on an evicted worker', async () => {
    const runner = createRunner();
    const slow = runner.run(
      buildInput(
        `const runAction = async () => {
           await new Promise((resolve) => setTimeout(resolve, 300));
           return { slow: true };
         };`
      )
    );

    // Fill the remaining slots, then one more to force the slow worker out of the pool.
    for (const marker of Array.from({ length: maxWorkers }, (_, index) => `evictor-${index}`)) {
      // eslint-disable-next-line no-await-in-loop -- sequential fills so LRU order is deterministic
      await runner.run(buildInput(counterScript(marker)));
    }

    await expect(slow).resolves.toEqual({ ok: true, value: { slow: true } });
  }, 10_000);

  it('drops every pooled worker when disposed', async () => {
    const runner = createRunner();

    await runner.run(buildInput(counterScript('a')));
    await runner.run(buildInput(counterScript('b')));
    expect(runner.size).toBe(2);

    await runner.dispose();
    expect(runner.size).toBe(0);

    await expect(runner.run(buildInput(counterScript('a')))).resolves.toMatchObject({
      value: { count: 1 },
    });
  });

  // Eviction and recycling drop a worker from the pool while it is still draining, so tracking
  // only the pool would leave those threads — and their ref'd deadline timers — running.
  it('terminates a worker that was evicted while still draining', async () => {
    const runner = createRunner();
    const evicted = runner.run(
      buildInput('const runAction = () => new Promise(() => {});', 'runAction', {})
    );

    for (const marker of Array.from({ length: maxWorkers }, (_, index) => `evictor-${index}`)) {
      // eslint-disable-next-line no-await-in-loop -- sequential fills so the stuck worker is oldest
      await runner.run(buildInput(counterScript(marker)));
    }

    expect(runner.size).toBe(maxWorkers);

    await runner.dispose();

    // The evicted worker was reachable for shutdown, so its run settles now rather than waiting out
    // its wall clock.
    await expect(evicted).resolves.toMatchObject({ ok: false, kind: 'runtime' });
  }, 10_000);

  it('settles the runs in flight when disposed', async () => {
    const runner = createRunner();
    const stuck = runner.run(buildInput('const runAction = () => new Promise(() => {});'));

    // Let the run reach the worker before tearing it down.
    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
    await runner.dispose();

    await expect(stuck).resolves.toMatchObject({ ok: false, kind: 'runtime' });
  }, 10_000);
});
