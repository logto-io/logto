import { conditional, type Optional, trySafe } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import { z } from 'zod';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { ScriptExecutionError, scriptFailureStatusCodes } from './errors.js';
import { type ScriptEntry, type ScriptResult } from './types.js';

type ScriptFailureKind = Extract<ScriptResult, { ok: false }>['kind'];

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
    /** The original error constructor name. Always present for `runtime`. */
    name: z.string().optional(),
    /** Absent for `denied`; redacted for every other kind. */
    stack: z.string().optional(),
  }),
});

/** A script failure reported by the Cloud runner, flattened out of its wire envelope. */
export type CloudScriptFailure = {
  kind: ScriptFailureKind;
  message: string;
  name?: string;
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
 * {@link parseCloudScriptFailure} to recover the failure kind.
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
   */
  const { value } = await client.post('/api/services/script-run', {
    body: { ...input, ...conditional(isTest && { isTest }) },
  });

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
    error: { kind, name, stack },
  } = result.data;

  return {
    kind,
    message,
    ...conditional(name !== undefined && { name }),
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
