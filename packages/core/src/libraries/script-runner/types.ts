/**
 * The name of the function a user script must expose as its entry point.
 *
 * The authoring contract is unchanged: Custom JWT scripts declare `getCustomJwtClaims` and
 * Actions scripts declare `runAction`.
 */
export type ScriptEntry = 'getCustomJwtClaims' | 'runAction';

/** The resource budget granted to a single script run. */
export type ScriptLimits = {
  /**
   * Host-side hard deadline for the whole run, including async work.
   *
   * This is the only bound that survives a promise that never settles, so every runner must
   * enforce it.
   */
  wallClockMs: number;
  /**
   * Memory budget for the run.
   *
   * Best-effort on the worker thread runner (V8 heap only, so off-heap allocation is not
   * capped), a hard per-isolate cap on the cloud runner.
   */
  memoryMb: number;
  /** CPU time budget. Only enforceable by the cloud runner. */
  cpuMs?: number;
  /** Number of outbound requests the script may make. Only enforceable by the cloud runner. */
  subRequests?: number;
};

/**
 * Outbound network policy applied to a script run.
 *
 * Only `allowAll` is in use today, which matches the unrestricted network access scripts
 * already have on every current path. The policy is passed explicitly so a runner never has to
 * infer it, and so host allowlists can be added later without changing the call sites.
 */
export type EgressPolicy = { mode: 'allowAll' } | { mode: 'denyAll' };

/**
 * The outcome of a script run.
 *
 * Failures are values rather than exceptions so both runners report the same set of kinds. The
 * mapping to HTTP status codes is unchanged from the previous execution path: `denied` → 403,
 * `syntax` and `type` → 422, and everything else → 500.
 *
 * Call-site validation of a successful return value (e.g. Custom JWT's Zod `z.record` parse) is
 * intentionally outside this union and keeps today's 400 "Invalid input" response — it is not a
 * runner failure kind and must not be folded into `type`.
 */
export type ScriptResult =
  | { ok: true; value: unknown }
  /** The script called `api.denyAccess()`. */
  | { ok: false; kind: 'denied'; message: string }
  /**
   * The run exceeded its wall clock deadline (`timeout`) or its memory budget (`oom`), and was
   * terminated by the host. No error is available since the script never returned.
   */
  | { ok: false; kind: 'timeout' | 'oom' }
  /**
   * The script could not be compiled (`syntax`), or the runner could not invoke/transfer the run
   * (`type`): missing or non-function entry, or a payload/return value that is not
   * structured-cloneable across the worker boundary.
   *
   * Does not cover call-site validation of a successfully returned value (e.g. Custom JWT's Zod
   * `z.record` parse) — that stays at 400 (see the {@link ScriptResult} note above).
   */
  | { ok: false; kind: 'syntax' | 'type'; message: string; stack?: string }
  /** The script threw while running. */
  | { ok: false; kind: 'runtime'; name: string; message: string; stack?: string };

export type ScriptRunInput = {
  script: string;
  entry: ScriptEntry;
  /**
   * Structured-cloneable data only. Runners may pass it across a thread or process boundary.
   *
   * Capability APIs such as `api` (with `denyAccess`) are not part of the payload: the runner
   * constructs and injects them on its side — functions cannot cross the structured-clone
   * boundary — and a denial comes back as `{ kind: 'denied' }`.
   */
  payload: Record<string, unknown>;
  limits: ScriptLimits;
  egress: EgressPolicy;
  /**
   * Opaque isolation scope for the run, e.g. the tenant id.
   *
   * A runner that reuses execution state across runs (such as a pooled worker's top-level script
   * state) must never share that state between runs with different key prefixes, so two tenants
   * running a byte-identical script do not share one worker heap.
   */
  keyPrefix?: string;
};

/**
 * The single interface for executing user-authored scripts, shared by Custom JWT and Actions.
 *
 * Implementations differ by deployment target, but must produce the same {@link ScriptResult}
 * kinds so callers never branch on where the script ran.
 */
export type ScriptRunner = {
  run(input: ScriptRunInput): Promise<ScriptResult>;
};
