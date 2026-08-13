import { conditional, type Optional, trySafe } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import ky from 'ky';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { ScriptExecutionError, scriptFailureStatusCodes } from './errors.js';
import { type ScriptEntry, type ScriptResult } from './types.js';

type ScriptFailureKind = Extract<ScriptResult, { ok: false }>['kind'];

/**
 * Host-side deadline for the whole `POST /api/services/script-run` round trip.
 *
 * The runner owns the per-isolate budget, but that bound stops at the isolate: the withtyped
 * client calls bare `fetch` with no `signal`, so without a deadline here a hung request is left
 * to undici's 300s defaults — on `PostSignIn` / `PostFirstFactorVerification` that hangs sign-in
 * inline, and `onExecutionError: 'allow'` cannot rescue a call that never returns.
 *
 * The value is a ceiling on how long core is willing to block, not an inference about the runner:
 * core can neither read nor set the per-isolate budget (the route body takes `cpuMs` and
 * `subRequests` only). 5s is the ceiling every other script path already carries — what the Azure
 * hop bounded (`remoteActionRequestTimeout`) and what a local run gets (`ossScriptLimits`) — so a
 * script blocks sign-in for the same time wherever it runs.
 *
 * Should the runner's own budget reach this, the two race and a runner-side breach can surface as
 * this timeout instead of the runner's `timeout`, losing its message. That is the accepted trade:
 * the failure is a timeout either way, and no script may hold sign-in longer than the ceiling.
 * Keeping the isolate budget below it keeps the runner's own report the one that wins.
 */
const cloudScriptRunTimeout = 5000;

/**
 * Bound `run` at {@link cloudScriptRunTimeout}, rejecting with the 500 `ScriptExecutionError` a
 * runner-side `timeout` produces so route-level handling stays identical.
 *
 * `run` receives an `AbortSignal` that fires at the same deadline, so a transport able to honour
 * it tears the socket down instead of leaking it: losing the race only stops the caller waiting,
 * it does not free the request. The cloud hop cannot use it — the withtyped client calls bare
 * `fetch` with no `signal` hook, leaving a hung request to undici's 300s defaults — but the
 * direct Worker call goes through ky, which does.
 */
const withCloudScriptRunTimeout = async <T>(
  run: (signal: AbortSignal) => Promise<T>
): Promise<T> => {
  // Node keeps the process alive for a pending timer, so the timeout must be cleared either way.
  // eslint-disable-next-line @silverhand/fp/no-let
  let timer: Optional<NodeJS.Timeout>;
  const abortController = new AbortController();

  try {
    return await Promise.race([
      run(abortController.signal),
      new Promise<never>((_resolve, reject) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        timer = setTimeout(() => {
          const error = new ScriptExecutionError(
            { message: `Script execution timed out after ${cloudScriptRunTimeout}ms.` },
            scriptFailureStatusCodes.timeout
          );

          // Reject with the pinned error first: aborting makes the raced call reject too, and the
          // winner of `Promise.race` must be this shape rather than ky's `AbortError`.
          reject(error);
          abortController.abort(error);
        }, cloudScriptRunTimeout);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * The longest upstream body kept in an error message.
 *
 * The message travels far further than the transport: both Console dry-run routes, the persisted
 * `customJwtError` audit-log field, and — when `blockIssuanceOnError` is set — the OIDC
 * `error_description` handed to the RP. An unbounded body puts a Cloudflare HTML error page or a
 * JWT-verification detail into all three, so it is capped to a prefix that still identifies the
 * failure.
 */
const maxUpstreamBodyLength = 256;

/**
 * The 500 `ScriptExecutionError` a transport failure on the direct Worker path produces.
 *
 * `responseBody` carries the upstream body in a structured field rather than in `message`, capped
 * to {@link maxUpstreamBodyLength}, so the text stays diagnosable without leaking an arbitrary
 * payload into the audit log or the RP-facing `error_description`.
 */
const buildWorkerTransportError = (message: string, body?: string): ScriptExecutionError =>
  new ScriptExecutionError(
    {
      message,
      ...conditional(
        body && {
          responseBody:
            body.length > maxUpstreamBodyLength ? `${body.slice(0, maxUpstreamBodyLength)}…` : body,
        }
      ),
    },
    500
  );

/**
 * The failure body `POST /api/services/script-run` returns, i.e. `ScriptFailureBody` in
 * `@logto/cloud-models`.
 *
 * Redeclared here rather than imported: `@logto/cloud` only ships its route types, so the shared
 * guard itself never reaches core. Indexing {@link scriptFailureStatusCodes} with the parsed
 * `kind` below keeps the two lists from drifting apart in the direction that matters — a kind
 * Cloud can send but core does not know about would not compile.
 *
 * The status alone cannot reconstruct the failure (`timeout`, `oom` and `runtime` all map to
 * 500), so `kind` is read from the body rather than inferred.
 */
const scriptFailureKinds = [
  'denied',
  'timeout',
  'oom',
  'syntax',
  'type',
  'runtime',
] as const satisfies readonly ScriptFailureKind[];

const cloudScriptFailureBodyGuard = z.object({
  message: z.string(),
  error: z.object({
    kind: z.enum(scriptFailureKinds),
    /** Absent for `denied`; redacted for every other kind. */
    stack: z.string().optional(),
  }),
});

/** A script failure reported by the Cloud runner, flattened out of its wire envelope. */
export type CloudScriptFailure = {
  kind: ScriptFailureKind;
  message: string;
  stack?: string;
};

/**
 * The envelope `POST /api/script-run` on the script-runner Worker returns, i.e. `ScriptResult`
 * in `@logto/cloud-models` — redeclared for the same no-shared-guard reason as
 * {@link cloudScriptFailureBodyGuard}.
 *
 * A script outcome — success or failure — always arrives as a 200 carrying this envelope; a
 * non-2xx means the script never ran (bad auth, malformed body, Worker misconfiguration) and is
 * a transport failure, not a script failure.
 */
const workerScriptResultGuard = z.union([
  z.object({
    ok: z.literal(true),
    value: z.unknown(),
  }),
  z.object({
    ok: z.literal(false),
    kind: z.enum(scriptFailureKinds),
    message: z.string(),
    /** The original error constructor name, when it survived far enough to be observed. */
    name: z.string().optional(),
    /** Absent for `denied`; redacted for every other kind. */
    stack: z.string().optional(),
  }),
]);

/**
 * Reshape a Worker script failure into the exact non-2xx body the cloud `script-run` route
 * produces for the same failure, so both transports are indistinguishable downstream.
 */
const buildWorkerScriptFailureError = ({
  kind,
  message,
  name,
  stack,
}: Extract<z.infer<typeof workerScriptResultGuard>, { ok: false }>): ScriptExecutionError => {
  // The cloud route defaults a nameless `runtime` failure's name to 'Error'
  // (`defaultRuntimeErrorName` in its reshaping) — mirrored so the bodies stay identical.
  const errorName = name ?? conditional(kind === 'runtime' && 'Error');

  return new ScriptExecutionError(
    {
      message,
      error: {
        kind,
        ...conditional(errorName !== undefined && { name: errorName }),
        ...conditional(stack !== undefined && { stack }),
      },
    },
    scriptFailureStatusCodes[kind]
  );
};

/**
 * Run the script on the script-runner Worker directly, skipping the cloud service hop.
 *
 * The Worker reports a script outcome as a 200 carrying its `ScriptResult` envelope rather than
 * as an error status. A failure is reshaped here into the exact non-2xx body the cloud
 * `script-run` route produces for the same failure — {@link ScriptExecutionError} is a
 * `ResponseError` — so {@link parseCloudScriptFailure} and every caller downstream cannot tell
 * the two transports apart.
 */
const runScriptOnWorker = async ({
  cloudConnection,
  endpoint,
  tenantId,
  isTest,
  signal,
  ...input
}: {
  cloudConnection: CloudConnectionLibrary;
  endpoint: string;
  tenantId: string;
  script: string;
  entry: ScriptEntry;
  payload: Record<string, unknown>;
  isTest?: boolean;
  signal: AbortSignal;
}): Promise<unknown> => {
  const accessToken = await cloudConnection.getWorkerAccessToken();

  const response = await ky.post(new URL('/api/script-run', endpoint), {
    json: { tenantId, ...input, ...conditional(isTest && { isTest }) },
    headers: { Authorization: `Bearer ${accessToken}` },
    /**
     * The round-trip deadline is owned by the caller's `withCloudScriptRunTimeout`; ky's own
     * timeout would only race it with a different error shape. The caller's signal fires at that
     * same deadline, so a hung Worker has its socket torn down rather than held to undici's
     * defaults.
     */
    timeout: false,
    signal,
    throwHttpErrors: false,
  });

  const body = await trySafe(async () => response.text());

  if (!response.ok) {
    /**
     * The Worker rejected the token. It is cached until expiry, so without dropping it here an
     * admin-tenant key rotation or a grant revocation would fail every run for the rest of the
     * token's lifetime when a single re-mint would recover.
     */
    if (response.status === 401 || response.status === 403) {
      cloudConnection.invalidateWorkerAccessToken();
    }

    throw buildWorkerTransportError(`Script runner error: ${response.status}`, body);
  }

  const result = workerScriptResultGuard.safeParse(
    conditional(body !== undefined && trySafe((): unknown => JSON.parse(body)))
  );

  if (!result.success) {
    /**
     * The envelope drifted — a new failure kind, a renamed field. The cloud hop keeps the
     * original body intact in this case (`parseCloudScriptFailure` misses and the callers rethrow
     * untouched), so carrying it here keeps the two transports equally diagnosable at exactly the
     * moment the text matters most.
     */
    throw buildWorkerTransportError('Script runner returned an unexpected response.', body);
  }

  if (result.data.ok) {
    return result.data.value;
  }

  throw buildWorkerScriptFailureError(result.data);
};

/**
 * Run a user script on the Cloud script runner.
 *
 * The Cloud counterpart of {@link runScriptOnWorkerPool}, shared by Custom JWT and Actions:
 * `entry` selects which authoring contract the runner invokes, and `payload` must carry exactly
 * what that entry promises — anything extra becomes a visible field of the script's argument.
 *
 * `limits` is deliberately not sent. The runner applies its own per-isolate defaults and clamps
 * any override to its ceiling, so duplicating a budget here would only let the two drift apart.
 *
 * Failures come back as a non-2xx and therefore as a withtyped `ResponseError`; pair this with
 * {@link parseCloudScriptFailure} to recover the failure kind. A breach of
 * {@link cloudScriptRunTimeout} is not one of them — it is a transport failure, so it throws the
 * same 500 `ScriptExecutionError` a runner-side `timeout` maps to and never parses as a script
 * failure.
 */
export const runScriptOnCloud = async ({
  cloudConnection,
  tenantId,
  isTest,
  ...input
}: {
  cloudConnection: CloudConnectionLibrary;
  /**
   * The tenant that owns the script. Sent only on the direct Worker path, where it scopes the
   * runner's isolate cache — the cloud route instead derives it from the caller's credentials
   * and rejects it in the body.
   */
  tenantId: string;
  script: string;
  entry: ScriptEntry;
  payload: Record<string, unknown>;
  /** Whether this is a dry run (Console "test" / the Management API test routes). */
  isTest?: boolean;
}): Promise<unknown> => {
  // TODO (LOG-14029): drop the cloud-service hop below (and this gate) once the direct Worker
  // path has been verified and the endpoint is injected in every region.
  const { isDevFeaturesEnabled, scriptRunnerEndpoint } = EnvSet.values;

  if (isDevFeaturesEnabled && scriptRunnerEndpoint) {
    return withCloudScriptRunTimeout(async (signal) =>
      runScriptOnWorker({
        cloudConnection,
        endpoint: scriptRunnerEndpoint,
        tenantId,
        isTest,
        signal,
        ...input,
      })
    );
  }

  const client = await cloudConnection.getClient();

  /**
   * The script's return value travels enveloped: the transport layer drops a falsy top-level
   * JSON body entirely, and `null` is the outcome of any script without a return statement.
   *
   * `?? {}` covers a 204, for which the withtyped client returns `undefined` whatever the route
   * declares — unreachable today given the response guard, but a bare destructure would throw a
   * `TypeError` before any caller could map it.
   */
  const { value } =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The route type says non-nullable; the client returns `undefined` for a 204 regardless.
    (await withCloudScriptRunTimeout(async () =>
      // The withtyped client takes no `signal`, so this path can only stop waiting, not cancel.
      client.post('/api/services/script-run', {
        body: { ...input, ...conditional(isTest && { isTest }) },
      })
    )) ?? {};

  return value;
};

/**
 * Recover the {@link CloudScriptFailure} a Cloud script-run error carries.
 *
 * Returns `undefined` for anything that is not a script failure — transport errors, a quota 403,
 * a runner-side 500 — which the caller must rethrow untouched.
 */
export const parseCloudScriptFailure = async (
  error: unknown
): Promise<Optional<CloudScriptFailure>> => {
  if (!(error instanceof ResponseError)) {
    return;
  }

  // Clone: the caller rethrows the original error on a parse miss, and its body must stay unread.
  const body = await trySafe<unknown>(async () => error.response.clone().json());
  const result = cloudScriptFailureBodyGuard.safeParse(body);

  if (!result.success) {
    return;
  }

  const {
    message,
    error: { kind, stack },
  } = result.data;

  return {
    kind,
    message,
    ...conditional(stack !== undefined && { stack }),
  };
};

/**
 * Convert a Cloud script failure into the {@link ScriptExecutionError} the routes already handle,
 * with the status pinned by {@link scriptFailureStatusCodes} — the same mapping the local runners
 * produce, so route-level handling never branches on where the script ran.
 *
 * Unlike {@link buildScriptFailureError}, no message is synthesized for `timeout` and `oom`: the
 * Cloud runner always names the failure itself.
 *
 * A `denied` failure needs the call site's own error body (Custom JWT attaches a
 * `CustomJwtErrorBody` so the denial is recognizable downstream), so callers that support
 * `api.denyAccess()` must intercept that kind before reaching here.
 */
export const buildCloudScriptFailureError = ({
  kind,
  message,
  stack,
}: CloudScriptFailure): ScriptExecutionError =>
  new ScriptExecutionError(
    { message, ...conditional(stack !== undefined && { stack }) },
    scriptFailureStatusCodes[kind]
  );
