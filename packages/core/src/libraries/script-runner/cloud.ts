import { conditional, type Optional, trySafe } from '@silverhand/essentials';
import ky from 'ky';
import { z } from 'zod';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { ScriptExecutionError, scriptFailureStatusCodes } from './errors.js';
import { type ScriptEntry, type ScriptResult } from './types.js';

type ScriptFailureKind = Extract<ScriptResult, { ok: false }>['kind'];

/**
 * Host-side deadline for the whole `POST /api/script-run` round trip.
 *
 * The runner owns the per-isolate budget, but that bound stops at the isolate: without a deadline
 * here a hung request is left to undici's 300s defaults — on `PostSignIn` /
 * `PostFirstFactorVerification` that hangs sign-in inline, and `onExecutionError: 'allow'` cannot
 * rescue a call that never returns.
 *
 * The value is a ceiling on how long core is willing to block, not an inference about the runner:
 * core can neither read nor set the per-isolate budget. 5s is the ceiling every other script path
 * already carries — what the Azure hop bounded (`remoteActionRequestTimeout`) and what a local run
 * gets (`ossScriptLimits`) — so a script blocks sign-in for the same time wherever it runs.
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
 * `run` receives an `AbortSignal` that fires at the same deadline, so the transport tears the
 * socket down instead of leaking it: losing the race only stops the caller waiting, it does not
 * free the request.
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
 * The 500 `ScriptExecutionError` a transport failure produces.
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
 * The failure kinds the script-runner Worker can report, i.e. those of `ScriptResult` in
 * `@logto/cloud-models`.
 *
 * Redeclared here rather than imported: that package ships no runtime code to core, so the shared
 * guard itself never reaches it. Satisfying {@link ScriptFailureKind} keeps the two lists from
 * drifting apart in the direction that matters — a kind the Worker can send but core does not know
 * about would not compile.
 */
const scriptFailureKinds = [
  'denied',
  'timeout',
  'oom',
  'syntax',
  'type',
  'runtime',
] as const satisfies readonly ScriptFailureKind[];

/**
 * The envelope `POST /api/script-run` on the script-runner Worker returns.
 *
 * A script outcome — success or failure — always arrives as a 200 carrying this envelope; a
 * non-2xx means the script never ran (bad auth, malformed body, Worker misconfiguration) and is
 * a transport failure, not a script failure.
 */
const cloudScriptResultGuard = z.union([
  z.object({
    ok: z.literal(true),
    value: z.unknown(),
  }),
  z.object({
    ok: z.literal(false),
    kind: z.enum(scriptFailureKinds),
    message: z.string(),
    /** Absent for `denied`; redacted for every other kind. */
    stack: z.string().optional(),
  }),
]);

/**
 * The outcome of a Cloud script run.
 *
 * Failures are values rather than exceptions, exactly as {@link runScriptOnWorkerPool} reports
 * them, so a caller maps a failure the same way wherever the script ran. An exception means the
 * script never ran: a transport failure or a breach of {@link cloudScriptRunTimeout}.
 */
export type CloudScriptResult = z.infer<typeof cloudScriptResultGuard>;

/** A script failure reported by the Cloud script runner. */
export type CloudScriptFailure = Extract<CloudScriptResult, { ok: false }>;

/**
 * Run a user script on the Cloud script runner, i.e. the script-runner Worker on Cloudflare's
 * edge.
 *
 * The Cloud counterpart of {@link runScriptOnWorkerPool}, shared by Custom JWT and Actions:
 * `entry` selects which authoring contract the runner invokes, and `payload` must carry exactly
 * what that entry promises — anything extra becomes a visible field of the script's argument.
 *
 * `limits` is deliberately not sent. The runner applies its own per-isolate defaults and clamps
 * any override to its ceiling, so duplicating a budget here would only let the two drift apart.
 *
 * A script failure comes back as a `{ ok: false }` result; pair it with
 * {@link buildCloudScriptFailureError} to get the error the routes already handle. A breach of
 * {@link cloudScriptRunTimeout} is not a script failure — it throws the same 500
 * `ScriptExecutionError` a runner-side `timeout` maps to.
 */
export const runScriptOnCloud = async ({
  cloudConnection,
  endpoint,
  tenantId,
  isTest,
  ...input
}: {
  cloudConnection: CloudConnectionLibrary;
  /** The script-runner Worker endpoint, i.e. `EnvSet.values.scriptRunnerEndpoint`. */
  endpoint: string;
  /** The tenant that owns the script. It scopes the runner's isolate cache. */
  tenantId: string;
  script: string;
  entry: ScriptEntry;
  payload: Record<string, unknown>;
  /** Whether this is a dry run (Console "test" / the Management API test routes). */
  isTest?: boolean;
}): Promise<CloudScriptResult> =>
  withCloudScriptRunTimeout(async (signal) => {
    const accessToken = await cloudConnection.getWorkerAccessToken();

    const response = await ky.post(new URL('/api/script-run', endpoint), {
      json: { tenantId, ...input, ...conditional(isTest && { isTest }) },
      headers: { Authorization: `Bearer ${accessToken}` },
      /**
       * The round-trip deadline is owned by `withCloudScriptRunTimeout`; ky's own timeout would
       * only race it with a different error shape. The signal fires at that same deadline, so a
       * hung Worker has its socket torn down rather than held to undici's defaults.
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

    const result = cloudScriptResultGuard.safeParse(
      conditional(body !== undefined && trySafe((): unknown => JSON.parse(body)))
    );

    if (!result.success) {
      /**
       * The envelope drifted — a new failure kind, a renamed field. Carrying the raw body keeps
       * the failure diagnosable at exactly the moment the text matters most.
       */
      throw buildWorkerTransportError('Script runner returned an unexpected response.', body);
    }

    return result.data;
  });

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
