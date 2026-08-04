import { types } from 'node:util';
import { runInThisContext } from 'node:vm';
import { parentPort, workerData } from 'node:worker_threads';

import type { ScriptResult } from '../../libraries/script-runner/types.js';
import type {
  ScriptFailure,
  ScriptWorkerData,
  ScriptWorkerRequest,
  ScriptWorkerResponse,
} from '../../libraries/script-runner/worker-protocol.js';

/**
 * The worker thread entry behind `WorkerThreadScriptRunner`.
 *
 * Three invariants hold this file together:
 *
 * 1. **This is not a sandbox.** The script gets the worker's globals — `process`, `setTimeout`,
 *    `Buffer`, `fetch`. Containment of hangs and crashes is the goal, and the host enforces it by
 *    terminating the thread; nothing here tries to restrict what the script can reach.
 * 2. **Node builtins only for value imports.** The bundled build inlines whatever a worker entry
 *    imports, so a single app import would drag `RequestError`, `i18next` and `zod` — and their
 *    top-level side effects — into every script worker. The protocol types come in through
 *    standalone `import type` statements, which both builds erase entirely.
 * 3. **Never `postMessage` an `Error`.** Structured clone degrades a subclass's `name` to `'Error'`
 *    and drops its own properties, so every thrown value is flattened to plain strings first.
 */

const port = parentPort;

if (!port) {
  throw new TypeError('The script runner worker must be spawned as a worker thread.');
}

const readWorkerData = (data: unknown): ScriptWorkerData => {
  if (
    typeof data === 'object' &&
    data !== null &&
    'script' in data &&
    typeof data.script === 'string' &&
    'entry' in data &&
    (data.entry === 'getCustomJwtClaims' || data.entry === 'runAction')
  ) {
    return { script: data.script, entry: data.entry };
  }

  throw new TypeError('The script runner worker received malformed worker data.');
};

// `workerData` is typed `any`; funnel it through `unknown` before narrowing.
const rawWorkerData: unknown = workerData;
const { script, entry } = readWorkerData(rawWorkerData);

/**
 * The sentinel thrown by `api.denyAccess()`.
 *
 * It is module-private, so a script can neither name it nor forge one, and it is created in the
 * same realm as the script, so `instanceof` is reliable.
 */
class DenyAccessSignal extends Error {
  constructor(readonly denialMessage: string) {
    super(denialMessage);
    this.name = 'DenyAccessSignal';
  }
}

type ThrownDescription = { name: string; message: string; stack?: string };

/**
 * `String()` is not total: it throws for a null-prototype object, and a script controls both
 * `Symbol.toPrimitive` and the global `String` binding.
 */
const safeString = (value: unknown) => {
  try {
    return String(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
};

/**
 * Flatten a thrown value the same way `buildScriptExecutionErrorBody` does on the host side.
 *
 * Total by construction. It is called from the handler's own `catch`, so a throw here would escape
 * as an unhandled rejection and take down the thread along with every run multiplexed on it — and
 * `name`, `message` and `stack` can all be script-controlled getters.
 */
const describeThrown = (error: unknown): ThrownDescription => {
  try {
    if (!types.isNativeError(error)) {
      return { name: 'Error', message: safeString(error) };
    }

    const { name, message, stack } = error;

    return {
      name: safeString(name),
      message: safeString(message),
      stack: typeof stack === 'string' ? stack : undefined,
    };
  } catch {
    return { name: 'Error', message: 'The script threw a value that could not be described.' };
  }
};

type EntryFunction = (input: Record<string, unknown>) => unknown;

const isEntryFunction = (value: unknown): value is EntryFunction => typeof value === 'function';

type Startup = { ok: true; entryFunction: EntryFunction } | { ok: false; failure: ScriptFailure };

const startup = ((): Startup => {
  try {
    /**
     * Evaluated in this realm on purpose. It buys accurate `filename`/stack output and makes
     * `instanceof SyntaxError` — plus the script's own error classes — work, which the cross-realm
     * `runInNewContext` never allowed. It is not an isolation boundary; the thread is.
     *
     * `typeof X === 'function' ? X : undefined` cannot throw a `ReferenceError` for an undeclared
     * entry, so anything thrown below is unambiguously the script's own top-level code. The leading
     * newline stops a trailing `//` comment from swallowing the appended expression.
     */
    const candidate: unknown = runInThisContext(
      `${script}\n;typeof ${entry} === 'function' ? ${entry} : undefined;`,
      { filename: 'logto-user-script.js' }
    );

    return isEntryFunction(candidate)
      ? { ok: true, entryFunction: candidate }
      : {
          ok: false,
          failure: {
            ok: false,
            kind: 'type',
            message: `The script does not have a function named \`${entry}\``,
          },
        };
  } catch (error: unknown) {
    const described = describeThrown(error);

    return {
      ok: false,
      failure:
        error instanceof SyntaxError
          ? { ok: false, kind: 'syntax', message: described.message, stack: described.stack }
          : { ok: false, kind: 'runtime', ...described },
    };
  }
})();

const postResult = (runId: number, result: ScriptResult) => {
  try {
    port.postMessage({ type: 'result', runId, result } satisfies ScriptWorkerResponse);
  } catch (error: unknown) {
    /**
     * Only reachable for a successful run: every failure shape is plain strings. The script
     * returned something structured clone cannot carry — a function, symbol, proxy, promise or
     * `Response`. The replacement is constant-shape and therefore cannot throw in turn, which is
     * what stops the throw escaping and killing the worker along with its co-resident runs.
     */
    port.postMessage({
      type: 'result',
      runId,
      result: {
        ok: false,
        kind: 'type',
        message: `The script returned a value that cannot be transferred from the worker thread: ${String(
          error
        )}`,
      },
    } satisfies ScriptWorkerResponse);
  }
};

/**
 * Built here because functions cannot be structured-cloned across the thread boundary.
 *
 * Only Custom JWT scripts get it: an Actions payload is `{ event, environmentVariables }` today, so
 * handing `runAction` an `api` would be a silent capability change.
 */
const api =
  entry === 'getCustomJwtClaims'
    ? Object.freeze({
        denyAccess: (message = 'Access denied'): never => {
          throw new DenyAccessSignal(message);
        },
      })
    : undefined;

const handleRequest = async ({ runId, payload }: ScriptWorkerRequest) => {
  if (!startup.ok) {
    return;
  }

  try {
    // Spreading preserves undefined-valued keys, so `'context' in payload` stays true exactly as
    // the host's `pick` produces it today.
    const value: unknown = await startup.entryFunction(api ? { ...payload, api } : payload);
    postResult(runId, { ok: true, value });
  } catch (error: unknown) {
    postResult(
      runId,
      error instanceof DenyAccessSignal
        ? { ok: false, kind: 'denied', message: error.denialMessage }
        : { ok: false, kind: 'runtime', ...describeThrown(error) }
    );
  }
};

// Never `async`, and never left unhandled: a rejected handler promise is an unhandled rejection,
// which kills the worker and every run sharing it. `handleRequest` already flattens every throw, so
// the rejection path is a backstop rather than an expected outcome.
port.on('message', (request: ScriptWorkerRequest) => {
  void (async () => {
    try {
      await handleRequest(request);
    } catch {
      postResult(request.runId, {
        ok: false,
        kind: 'runtime',
        name: 'Error',
        message: 'The script runner could not describe the value the script threw.',
      });
    }
  })();
});

// The worker never exits on its own — `postMessage` delivery is asynchronous, so exiting here could
// drop the message that is still in flight. The host terminates it.
port.postMessage(
  (startup.ok
    ? { type: 'ready' }
    : { type: 'startup-failed', failure: startup.failure }) satisfies ScriptWorkerResponse
);
