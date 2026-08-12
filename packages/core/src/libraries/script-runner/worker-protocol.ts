import { type ScriptEntry, type ScriptResult } from './types.js';

/**
 * The failure half of {@link ScriptResult}.
 *
 * Every member is plain data, which is what lets a failure cross the thread boundary unchanged.
 */
export type ScriptFailure = Extract<ScriptResult, { ok: false }>;

/**
 * The spawn-time payload, passed as `workerData`.
 *
 * It is fixed for the worker's whole life: the script is evaluated exactly once at startup and the
 * pool key is derived from it, so a worker is bound to a single script forever.
 */
export type ScriptWorkerData = {
  script: string;
  entry: ScriptEntry;
};

/**
 * Parent to worker. There is only one message shape, so it carries no discriminant.
 *
 * `runId` is mandatory: workers are pooled and reused, so a late response from one run must never
 * be attributed to the next.
 */
export type ScriptWorkerRequest = {
  runId: number;
  payload: Record<string, unknown>;
};

/**
 * Worker to parent. Exactly one of `ready` or `startup-failed` is sent, before any `result`.
 *
 * `startup-failed` is a message of its own rather than a deferred first `result` so that a script
 * which cannot be compiled never occupies a pool slot.
 */
export type ScriptWorkerResponse =
  | { type: 'ready' }
  | { type: 'startup-failed'; failure: ScriptFailure }
  | { type: 'result'; runId: number; result: ScriptResult };
