import { CustomJwtErrorCode, LogtoJwtTokenKeyType, type CustomJwtFetcher } from '@logto/schemas';

import { type ScriptRunner } from './script-runner/types.js';
import { type ScriptFailure } from './script-runner/worker-protocol.js';

const { jest } = import.meta;

const runScript = jest.fn() as jest.MockedFunction<ScriptRunner['run']>;

// The shared runner in `run.js` instantiates this class at module load, so mocking it here routes
// every `runScriptOnWorkerPool` call through `runScript` while the rest of the adapter — limits,
// egress, `buildScriptFailureError`, the record parse — stays real.
jest.unstable_mockModule('#src/libraries/script-runner/worker-thread-script-runner.js', () => ({
  WorkerThreadScriptRunner: class {
    run = runScript;
  },
}));

const { JwtCustomizerLibrary } = await import('./jwt-customizer.js');
const { ossScriptLimits, ScriptExecutionError } = await import('./script-runner/index.js');

const script = 'const getCustomJwtClaims = () => ({});';
const token = Object.freeze({ sub: 'user-id' });
const context = Object.freeze({ user: { id: 'user-id' } });
const environmentVariables = Object.freeze({ API_KEY: 'api-key' });

const buildData = (): CustomJwtFetcher => ({
  script,
  tokenType: LogtoJwtTokenKeyType.AccessToken,
  token: { ...token },
  context: { ...context },
  environmentVariables: { ...environmentVariables },
});

const tenantId = 'test-tenant';

const runAdapter = async () => JwtCustomizerLibrary.runScriptInLocalVm(buildData(), tenantId);

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

describe('JwtCustomizerLibrary worker-pool adapter', () => {
  beforeEach(() => {
    runScript.mockReset();
  });

  it('hands the runner the standard OSS limits and the allow-all egress policy', async () => {
    runScript.mockResolvedValueOnce({ ok: true, value: {} });

    await runAdapter();

    expect(runScript).toHaveBeenCalledTimes(1);
    expect(runScript).toHaveBeenCalledWith({
      script,
      entry: 'getCustomJwtClaims',
      payload: { token, context, environmentVariables },
      keyPrefix: tenantId,
      limits: ossScriptLimits,
      egress: { mode: 'allowAll' },
    });
  });

  // `toHaveBeenCalledWith` ignores keys whose value is `undefined`, so the exact key list is
  // asserted separately: the worker injects `api` on its side, and `script` or `tokenType` in the
  // payload would leak across the thread boundary unnoticed otherwise.
  it('builds a payload of exactly the token, context and environment variables', async () => {
    runScript.mockResolvedValueOnce({ ok: true, value: {} });

    await runAdapter();

    const input = runScript.mock.calls[0]?.[0];
    expect(Object.keys(input?.payload ?? {})).toEqual(['token', 'context', 'environmentVariables']);
  });

  it('returns the record the script produced', async () => {
    runScript.mockResolvedValueOnce({ ok: true, value: { role: 'admin' } });

    await expect(runAdapter()).resolves.toEqual({ role: 'admin' });
  });

  // Call-site validation of a successful run, not a runner failure — it must keep today's 400
  // rather than joining the `type` → 422 mapping.
  it('rejects a non-record value with the 400 the local VM used', async () => {
    runScript.mockResolvedValueOnce({ ok: true, value: 42 });

    const { status, body } = await catchScriptExecutionError(runAdapter());

    expect(status).toBe(400);
    expect(body).toMatchObject({ message: 'Invalid input' });
  });

  it('attaches the access-denied error body to a denied failure', async () => {
    runScript.mockResolvedValueOnce({ ok: false, kind: 'denied', message: 'blocked' });

    const { status, body } = await catchScriptExecutionError(runAdapter());

    expect(status).toBe(403);
    expect(body).toEqual({
      message: 'blocked',
      error: { code: CustomJwtErrorCode.AccessDenied, message: 'blocked' },
    });
  });

  describe('failure mapping keeps the pinned status codes', () => {
    it.each<[ScriptFailure, number, Record<string, unknown>]>([
      [
        { ok: false, kind: 'syntax', message: 'Unexpected token', stack: 'syntax-stack' },
        422,
        { message: 'Unexpected token', stack: 'syntax-stack' },
      ],
      [
        { ok: false, kind: 'type', message: 'The script return value must be JSON-serializable.' },
        422,
        { message: 'The script return value must be JSON-serializable.' },
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
