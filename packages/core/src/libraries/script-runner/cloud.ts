import { conditional, type Optional, trySafe } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import { z } from 'zod';

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
 * Set above the runner's own wall clock (the 5s `ossScriptLimits` grants locally) so a slow script
 * hits that bound and reports a real `timeout`, leaving this to fire only when the hop itself is
 * stuck. Racing does not cancel the underlying request — the runner still finishes and drops the
 * response — which is fine: the run is bounded on its side, and it is the caller that must stop
 * waiting.
 */
const cloudScriptRunTimeout = 10_000;

/**
 * Bound `run` at {@link cloudScriptRunTimeout}, rejecting with the 500 `ScriptExecutionError` a
 * runner-side `timeout` produces so route-level handling stays identical.
 */
const withCloudScriptRunTimeout = async <T>(run: Promise<T>): Promise<T> => {
  // Node keeps the process alive for a pending timer, so the timeout must be cleared either way.
  // eslint-disable-next-line @silverhand/fp/no-let
  let timer: Optional<NodeJS.Timeout>;

  try {
    return await Promise.race([
      run,
      new Promise<never>((_resolve, reject) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        timer = setTimeout(() => {
          reject(
            new ScriptExecutionError(
              { message: `Script execution timed out after ${cloudScriptRunTimeout}ms.` },
              scriptFailureStatusCodes.timeout
            )
          );
        }, cloudScriptRunTimeout);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

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
const cloudScriptFailureBodyGuard = z.object({
  message: z.string(),
  error: z.object({
    kind: z.enum(['denied', 'timeout', 'oom', 'syntax', 'type', 'runtime']),
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
  isTest,
  ...input
}: {
  cloudConnection: CloudConnectionLibrary;
  script: string;
  entry: ScriptEntry;
  payload: Record<string, unknown>;
  /** Whether this is a dry run (Console "test" / the Management API test routes). */
  isTest?: boolean;
}): Promise<unknown> => {
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
    (await withCloudScriptRunTimeout(
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
