import { type ScriptEntry, type ScriptRunInput } from './types.js';
import {
  WorkerThreadScriptRunner,
  type WorkerThreadScriptRunnerOptions,
} from './worker-thread-script-runner.js';

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

describe('WorkerThreadScriptRunner pooling', () => {
  const runners: WorkerThreadScriptRunner[] = [];

  const createRunner = (options?: WorkerThreadScriptRunnerOptions) => {
    const runner = new WorkerThreadScriptRunner(options);

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

  it('does not share a worker between key prefixes', async () => {
    const first = createRunner({ keyPrefix: 'tenant-a' });
    const second = createRunner({ keyPrefix: 'tenant-b' });
    const input = buildInput(counterScript());

    await expect(first.run(input)).resolves.toMatchObject({ value: { count: 1 } });
    await expect(second.run(input)).resolves.toMatchObject({ value: { count: 1 } });
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

  it('recycles a worker once it hits the invocation cap', async () => {
    const runner = createRunner({ maxInvocationsPerWorker: 2 });
    const input = buildInput(counterScript());

    await expect(runner.run(input)).resolves.toMatchObject({ value: { count: 1 } });
    await expect(runner.run(input)).resolves.toMatchObject({ value: { count: 2 } });
    await expect(runner.run(input)).resolves.toMatchObject({ value: { count: 1 } });
  });

  it('terminates an idle worker once its ttl expires', async () => {
    const runner = createRunner({ idleTtlMs: 50 });
    const input = buildInput(counterScript());

    await expect(runner.run(input)).resolves.toMatchObject({ value: { count: 1 } });

    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    expect(runner.size).toBe(0);
    await expect(runner.run(input)).resolves.toMatchObject({ value: { count: 1 } });
  }, 10_000);

  it('evicts the least recently used worker at the cap', async () => {
    const runner = createRunner({ maxWorkers: 2 });

    await runner.run(buildInput(counterScript('a')));
    await runner.run(buildInput(counterScript('b')));
    expect(runner.size).toBe(2);

    await runner.run(buildInput(counterScript('c')));
    expect(runner.size).toBe(2);

    // `a` was evicted, so it starts counting over.
    await expect(runner.run(buildInput(counterScript('a')))).resolves.toMatchObject({
      value: { marker: 'a', count: 1 },
    });
  });

  // Reaching the cap is a capacity decision, not a fault, so an evicted worker drains first.
  it('finishes the run in flight on an evicted worker', async () => {
    const runner = createRunner({ maxWorkers: 1 });
    const slow = runner.run(
      buildInput(
        `const runAction = async () => {
           await new Promise((resolve) => setTimeout(resolve, 300));
           return { slow: true };
         };`
      )
    );

    await runner.run(buildInput(counterScript('evictor')));

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
    const runner = createRunner({ maxWorkers: 1 });
    const evicted = runner.run(
      buildInput('const runAction = () => new Promise(() => {});', 'runAction', {})
    );

    await runner.run(buildInput(counterScript('evictor')));
    expect(runner.size).toBe(1);

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
