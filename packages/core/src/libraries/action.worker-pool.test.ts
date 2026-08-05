import { type ScriptRunner } from './script-runner/types.js';
import { type ScriptFailure } from './script-runner/worker-protocol.js';

const { jest } = import.meta;

const runScript = jest.fn() as jest.MockedFunction<ScriptRunner['run']>;

// The shared runner in `run.js` instantiates this class at module load, so mocking it here routes
// every `runScriptOnWorkerPool` call through `runScript` while the rest of the adapter — limits,
// egress, `buildScriptFailureError` — stays real.
jest.unstable_mockModule('#src/libraries/script-runner/worker-thread-script-runner.js', () => ({
  WorkerThreadScriptRunner: class {
    run = runScript;
  },
}));

const { EnvSet } = await import('#src/env-set/index.js');
const { ActionLibrary } = await import('./action.js');
const { ossScriptLimits, ScriptExecutionError } = await import('./script-runner/index.js');

const script = 'const runAction = () => ({});';
const event = Object.freeze({ user: { name: 'Foo' } });
const environmentVariables = Object.freeze({ API_KEY: 'api-key' });

const runAdapter = async () =>
  ActionLibrary.runScriptInLocalVm({ script, event, environmentVariables });

const catchScriptExecutionError = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error: unknown) {
    if (error instanceof ScriptExecutionError) {
      const body: unknown = await error.response.json();

      return { status: error.status, body };
    }

    throw error;
  }

  throw new Error('Expected the adapter to throw a ScriptExecutionError.');
};

describe('ActionLibrary worker-pool adapter', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

  beforeEach(() => {
    runScript.mockReset();
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  afterAll(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('hands the runner the standard OSS limits and the allow-all egress policy', async () => {
    runScript.mockResolvedValueOnce({ ok: true, value: {} });

    await runAdapter();

    expect(runScript).toHaveBeenCalledTimes(1);
    expect(runScript).toHaveBeenCalledWith({
      script,
      entry: 'runAction',
      payload: { event, environmentVariables },
      limits: ossScriptLimits,
      egress: { mode: 'allowAll' },
    });
  });

  // `toHaveBeenCalledWith` ignores keys whose value is `undefined`, so the exact key list is
  // asserted separately: leaking `script` (or an `api`) into the payload would cross the thread
  // boundary unnoticed otherwise.
  it('builds a payload of exactly the event and the environment variables', async () => {
    runScript.mockResolvedValueOnce({ ok: true, value: {} });

    await runAdapter();

    const input = runScript.mock.calls[0]?.[0];
    expect(Object.keys(input?.payload ?? {})).toEqual(['event', 'environmentVariables']);
  });

  it('returns the successful value verbatim without record validation', async () => {
    // Actions leave result validation to their call sites, so even a non-record value must come
    // back untouched — unlike the Custom JWT adapter.
    runScript.mockResolvedValueOnce({ ok: true, value: 42 });

    await expect(runAdapter()).resolves.toBe(42);
  });

  describe('failure mapping keeps the pinned status codes', () => {
    it.each<[ScriptFailure, number, Record<string, unknown>]>([
      [{ ok: false, kind: 'denied', message: 'nope' }, 403, { message: 'nope' }],
      [
        { ok: false, kind: 'syntax', message: 'Unexpected token', stack: 'syntax-stack' },
        422,
        { message: 'Unexpected token', stack: 'syntax-stack' },
      ],
      [
        { ok: false, kind: 'type', message: 'The script payload cannot be transferred' },
        422,
        { message: 'The script payload cannot be transferred' },
      ],
      [
        { ok: false, kind: 'runtime', name: 'ScriptError', message: 'boom', stack: 'run-stack' },
        500,
        { message: 'boom', stack: 'run-stack' },
      ],
      [
        { ok: false, kind: 'timeout' },
        500,
        { message: `Script execution timed out after ${ossScriptLimits.wallClockMs}ms.` },
      ],
      [{ ok: false, kind: 'oom' }, 500, { message: 'Script execution exceeded the memory limit.' }],
    ])('maps a %o failure', async (failure, expectedStatus, expectedBody) => {
      runScript.mockResolvedValueOnce(failure);

      const { status, body } = await catchScriptExecutionError(runAdapter());

      expect(status).toBe(expectedStatus);
      expect(body).toEqual(expectedBody);
    });
  });

  // TODO (LOG-13956): drop these together with the legacy `node:vm` execution path.
  describe('the legacy `node:vm` path while dev features are disabled', () => {
    beforeEach(() => {
      Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
    });

    it('runs the script without touching the worker pool', async () => {
      await expect(
        ActionLibrary.runScriptInLocalVm({
          script: 'const runAction = ({ event }) => ({ echoed: event.user.name });',
          event,
          environmentVariables,
        })
      ).resolves.toEqual({ echoed: 'Foo' });
      expect(runScript).not.toHaveBeenCalled();
    });

    it('maps a thrown script error to the runtime status', async () => {
      const { status, body } = await catchScriptExecutionError(
        ActionLibrary.runScriptInLocalVm({
          script: "const runAction = () => { throw new Error('legacy boom'); };",
          event,
          environmentVariables,
        })
      );

      expect(status).toBe(500);
      expect(body).toMatchObject({ message: 'legacy boom' });
    });

    // The vm constructs the SyntaxError in the script's realm, so the host-side `instanceof`
    // classification never fires and a compile error falls through to the runtime status. The
    // worker runner evaluates in its own realm and is what makes syntax failures report 422.
    it('maps a script that cannot be compiled to the runtime status', async () => {
      const { status, body } = await catchScriptExecutionError(
        ActionLibrary.runScriptInLocalVm({
          script: 'const runAction = () => {',
          event,
          environmentVariables,
        })
      );

      expect(status).toBe(500);
      expect(body).toMatchObject({
        message: expect.stringContaining('Unexpected end of input') as string,
      });
    });

    // An undeclared entry throws a ReferenceError inside the vm realm (also invisible to the
    // host-side `instanceof`) — only an entry that exists but is not a function reaches the
    // host-thrown TypeError and its 422.
    it('maps a non-function entry to the type status', async () => {
      const { status, body } = await catchScriptExecutionError(
        ActionLibrary.runScriptInLocalVm({
          script: 'const runAction = 1;',
          event,
          environmentVariables,
        })
      );

      expect(status).toBe(422);
      expect(body).toMatchObject({
        message: 'The script does not have a function named `runAction`',
      });
    });
  });
});
