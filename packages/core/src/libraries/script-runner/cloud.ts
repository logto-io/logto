import { conditional, trySafe } from '@silverhand/essentials';
import ky, { TimeoutError } from 'ky';
import { z } from 'zod';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { ScriptExecutionError, scriptFailureStatusCodes } from './errors.js';
import { type ScriptEntry, type ScriptResult } from './types.js';

type ScriptFailureKind = Extract<ScriptResult, { ok: false }>['kind'];

/**
 * Host-side deadline for the whole `POST /api/script-run` round trip.
 *
 * The runner owns the per-isolate budget, but that bound stops at the isolate: a hung request
 * would otherwise hang sign-in inline, and `onExecutionError: 'allow'` cannot rescue a call that
 * never returns. 5s is the ceiling every other script path already carries — what the Azure hop
 * bounded (`remoteActionRequestTimeout`) and what a local run gets (`ossScriptLimits`) — so a
 * script blocks sign-in for the same time wherever it runs. Keeping the isolate budget below it
 * keeps the runner's own failure report the one that wins the race.
 */
const cloudScriptRunTimeout = 5000;

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
 * The 500 `ScriptExecutionError` a transport failure produces.
 *
 * The upstream body is deliberately dropped: this error reaches the persisted `customJwtError`
 * audit-log field and — with `blockIssuanceOnError` — the OIDC `error_description` handed to the
 * RP, where a Cloudflare error page or a JWT-verification detail has no business. The status
 * identifies the failure; the details belong in the Worker's own logs.
 */
const buildTransportError = (message: string): ScriptExecutionError =>
  new ScriptExecutionError({ message }, 500);

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
}): Promise<CloudScriptResult> => {
  const accessToken = await cloudConnection.getWorkerAccessToken();

  const response = await ky
    .post(new URL('/api/script-run', endpoint), {
      json: { tenantId, ...input, isTest },
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: cloudScriptRunTimeout,
      throwHttpErrors: false,
    })
    .catch((error: unknown) => {
      if (error instanceof TimeoutError) {
        throw new ScriptExecutionError(
          { message: `Script execution timed out after ${cloudScriptRunTimeout}ms.` },
          scriptFailureStatusCodes.timeout
        );
      }

      throw error;
    });

  if (!response.ok) {
    /**
     * The Worker rejected the token. It is cached until expiry, so without dropping it here an
     * admin-tenant key rotation or a grant revocation would fail every run for the rest of the
     * token's lifetime when a single re-mint would recover.
     */
    if (response.status === 401 || response.status === 403) {
      cloudConnection.invalidateWorkerAccessToken();
    }

    throw buildTransportError(`Script runner error: ${response.status}`);
  }

  const result = cloudScriptResultGuard.safeParse(
    await trySafe<unknown>(async () => response.json())
  );

  // The envelope drifted — a new failure kind, a renamed field. Read the Worker's own logs.
  if (!result.success) {
    throw buildTransportError('Script runner returned an unexpected response.');
  }

  return result.data;
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
