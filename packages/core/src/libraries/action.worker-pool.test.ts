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

const { ActionLibrary } = await import('./action.js');
const { ossScriptLimits, ScriptExecutionError } = await import('./script-runner/index.js');

const script = 'const runAction = () => ({});';
const event = Object.freeze({ user: { name: 'Foo' } });
const environmentVariables = Object.freeze({ API_KEY: 'api-key' });

const tenantId = 'test-tenant';

const runAdapter = async () =>
  ActionLibrary.runScriptLocally({ script, event, environmentVariables }, tenantId);

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
  beforeEach(() => {
    runScript.mockReset();
  });

  it('hands the runner the standard OSS limits and the allow-all egress policy', async () => {
    runScript.mockResolvedValueOnce({ ok: true, value: {} });

    await runAdapter();

    expect(runScript).toHaveBeenCalledTimes(1);
    expect(runScript).toHaveBeenCalledWith({
      script,
      entry: 'runAction',
      payload: { event, environmentVariables },
      keyPrefix: tenantId,
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
});
