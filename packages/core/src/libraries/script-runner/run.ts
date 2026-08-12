import { ScriptExecutionError, scriptFailureStatusCodes } from './errors.js';
import { type ScriptEntry, type ScriptLimits, type ScriptResult } from './types.js';
import { type ScriptFailure } from './worker-protocol.js';
import { WorkerThreadScriptRunner } from './worker-thread-script-runner.js';

/**
 * The resource budget applied to every script run on the worker thread runner.
 *
 * The wall clock is a real bound: it covers the whole run, including asynchronous work and worker
 * startup, and the host terminates the thread on breach. The local VM it replaces only bounded
 * synchronous execution (3 seconds up to the first `await`), so an async script used to run
 * unbounded — a `fetch`-heavy script slower than this deadline now fails instead of hanging token
 * issuance forever.
 *
 * `memoryMb` matches the Cloud per-isolate budget. On worker threads it caps the V8 old space
 * only, and a process-global `--max-old-space-size` overrides it — the wall clock is the bound
 * that always holds.
 */
export const ossScriptLimits: ScriptLimits = Object.freeze({
  wallClockMs: 5000,
  memoryMb: 128,
});

/**
 * The process-wide runner shared by Custom JWT and Actions.
 *
 * A single pool is deliberate: workers are keyed by
 * `{tenantId}:{entry}:{memoryMb}:{sha256(script)}`, so neither the two libraries nor two tenants
 * can ever collide on a worker, and one pool keeps the worker cap a process-level bound. Never dispose it from a call site — it outlives every tenant.
 */
const sharedRunner = new WorkerThreadScriptRunner();

/**
 * Run a user script on the shared worker pool with the standard OSS limits.
 *
 * Reachable only when `EnvSet.values.isCloud` is `false` (Cloud runs scripts remotely) and, until
 * the runner is manually verified and released, behind `isDevFeaturesEnabled` — production keeps
 * the legacy `node:vm` path. The payload must be structured-cloneable — capability APIs such as
 * `api.denyAccess` are injected by the worker and must not be part of it.
 */
export const runScriptOnWorkerPool = async ({
  tenantId,
  ...input
}: {
  script: string;
  entry: ScriptEntry;
  payload: Record<string, unknown>;
  /**
   * The tenant the script belongs to. Required, not optional: worker reuse deliberately persists
   * top-level script state, so two tenants running byte-identical script text must never share a
   * worker heap — the tenant id becomes the pool key's prefix to guarantee that.
   */
  tenantId: string;
}): Promise<ScriptResult> =>
  sharedRunner.run({
    ...input,
    keyPrefix: tenantId,
    limits: ossScriptLimits,
    egress: { mode: 'allowAll' },
  });

/**
 * Convert a runner-reported failure into the {@link ScriptExecutionError} the routes already
 * handle, with the status pinned by {@link scriptFailureStatusCodes}.
 *
 * `timeout` and `oom` carry no message of their own — the script never returned — so one is
 * synthesized here: `parseCustomJwtResponseError` requires a top-level string `message`.
 *
 * The Custom JWT adapter intercepts `denied` before calling this to attach its
 * `CustomJwtErrorBody`; the generic mapping below only carries the denial message.
 */
export const buildScriptFailureError = (failure: ScriptFailure): ScriptExecutionError => {
  const statusCode = scriptFailureStatusCodes[failure.kind];

  switch (failure.kind) {
    case 'timeout': {
      return new ScriptExecutionError(
        { message: `Script execution timed out after ${ossScriptLimits.wallClockMs}ms.` },
        statusCode
      );
    }
    case 'oom': {
      return new ScriptExecutionError(
        { message: 'Script execution exceeded the memory limit.' },
        statusCode
      );
    }
    case 'denied': {
      return new ScriptExecutionError({ message: failure.message }, statusCode);
    }
    case 'syntax':
    case 'type':
    case 'runtime': {
      return new ScriptExecutionError(
        { message: failure.message, stack: failure.stack },
        statusCode
      );
    }
  }
};
