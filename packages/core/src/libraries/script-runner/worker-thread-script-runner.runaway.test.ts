import { type ScriptRunInput } from './types.js';
import { WorkerThreadScriptRunner } from './worker-thread-script-runner.js';

const buildInput = (
  script: string,
  limits: Partial<ScriptRunInput['limits']> = {}
): ScriptRunInput => ({
  script,
  entry: 'runAction',
  payload: {},
  limits: { wallClockMs: 300, memoryMb: 64, ...limits },
  egress: { mode: 'allowAll' },
});

/**
 * The runner exists so a runaway script cannot take the host with it. Every case here hangs or
 * exhausts memory under the `node:vm` path these tests replace.
 */
describe('WorkerThreadScriptRunner runaway containment', () => {
  const runners: WorkerThreadScriptRunner[] = [];

  const createRunner = () => {
    const runner = new WorkerThreadScriptRunner({ startupTimeoutMs: 5000 });

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- test bookkeeping for teardown
    runners.push(runner);

    return runner;
  };

  afterEach(async () => {
    await Promise.all(runners.map(async (runner) => runner.dispose()));
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- test bookkeeping for teardown
    runners.splice(0, runners.length);
  });

  it('times out a script whose top level never finishes', async () => {
    const runner = createRunner();

    await expect(runner.run(buildInput('while (true) {}'))).resolves.toEqual({
      ok: false,
      kind: 'timeout',
    });
  }, 10_000);

  it('times out an infinite loop inside the entry function', async () => {
    const runner = createRunner();

    await expect(
      runner.run(buildInput('const runAction = () => { while (true) {} };'))
    ).resolves.toEqual({ ok: false, kind: 'timeout' });
  }, 10_000);

  // The case the `node:vm` timeout never covered: it bounds synchronous execution only, so a
  // pending promise waits forever.
  it('times out a promise that never settles', async () => {
    const runner = createRunner();

    await expect(
      runner.run(buildInput('const runAction = () => new Promise(() => {});'))
    ).resolves.toEqual({ ok: false, kind: 'timeout' });
  }, 10_000);

  it('reports oom for a runaway allocation', async () => {
    const runner = createRunner();
    const result = await runner.run(
      buildInput(
        `const runAction = () => {
           const chunks = [];
           while (true) { chunks.push(new Array(1_000_000).fill('x')); }
         };`,
        { wallClockMs: 20_000, memoryMb: 16 }
      )
    );

    expect(result).toEqual({ ok: false, kind: 'oom' });
  }, 30_000);

  it('reports runtime when the script exits the thread', async () => {
    const runner = createRunner();
    const result = await runner.run(
      buildInput('const runAction = () => { process.exit(0); };', { wallClockMs: 5000 })
    );

    expect(result).toMatchObject({ ok: false, kind: 'runtime' });
  }, 10_000);

  it('serves the next run after a timeout on a fresh worker', async () => {
    const runner = createRunner();
    const script = 'const runAction = () => { while (true) {} };';

    await expect(runner.run(buildInput(script))).resolves.toEqual({ ok: false, kind: 'timeout' });
    // The faulted worker left the pool rather than lingering as a corpse the next run would await.
    expect(runner.size).toBe(0);
    await expect(runner.run(buildInput(script))).resolves.toEqual({ ok: false, kind: 'timeout' });
    await expect(
      runner.run(buildInput('const runAction = () => ({ ok: true });'))
    ).resolves.toEqual({ ok: true, value: { ok: true } });
  }, 15_000);

  it('keeps the host event loop responsive while a script runs away', async () => {
    const runner = createRunner();
    const ticks = { count: 0 };
    const interval = setInterval(() => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- counting ticks is the assertion
      ticks.count += 1;
    }, 10);

    try {
      await expect(
        runner.run(buildInput('const runAction = () => { while (true) {} };', { wallClockMs: 500 }))
      ).resolves.toEqual({ ok: false, kind: 'timeout' });
    } finally {
      clearInterval(interval);
    }

    // A blocked host loop would fire the interval a handful of times at most.
    expect(ticks.count).toBeGreaterThan(15);
  }, 10_000);
});
