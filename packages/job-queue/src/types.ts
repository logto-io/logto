import { type Nullable } from '@silverhand/essentials';

/**
 * Common secret and configuration field names checked on typed payloads.
 *
 * Handlers must read secrets and mutable delivery configuration (signing keys, endpoint URLs,
 * custom auth headers, credentials, enabled status) from the database at execution time rather
 * than copying them into `jobs.payload`.
 */
export type ForbiddenJobPayloadKey =
  | 'signingKey'
  | 'signing_key'
  | 'secret'
  | 'clientSecret'
  | 'client_secret'
  | 'apiKey'
  | 'api_key'
  | 'accessToken'
  | 'access_token'
  | 'privateKey'
  | 'private_key'
  | 'password'
  | 'hookConfig'
  | 'headers';

type ExtractForbiddenPayloadKey<Member> =
  Member extends Record<string, unknown> ? Extract<keyof Member, ForbiddenJobPayloadKey> : never;

/**
 * Rejects the listed top-level keys on typed object payloads. It does not inspect nested fields,
 * string payloads, or what the enqueue path persists.
 */
export type SafeJobPayload<Payload> = [ExtractForbiddenPayloadKey<Payload>] extends [never]
  ? Payload
  : never;

type ForbiddenPayloadBrand<Payload> = [ExtractForbiddenPayloadKey<Payload>] extends [never]
  ? unknown
  : {
      readonly __forbiddenJobPayloadKey: ExtractForbiddenPayloadKey<Payload>;
    };

/**
 * Database-agnostic representation of a claimed `jobs` row returned by {@link JobQueueQueries.claimDue}.
 *
 * Timestamps (`nextAttemptAt`, `createdAt`) are represented in unix epoch milliseconds.
 */
export type ClaimedJobRow = {
  tenantId?: string;
  id: string;
  type: string;
  groupKey: string;
  dedupeKey: Nullable<string>;
  payload: string;
  /** The 1-based attempt number for this claim, including the current claim. */
  attempts: number;
  nextAttemptAt: number;
  claimedBy: Nullable<string>;
  createdAt: number;
};

/**
 * Parsed job passed to {@link JobHandler.handle} and {@link JobHandler.onExhausted}.
 * Preserves the exact serialized string in `rawPayload` alongside the parsed `payload`.
 */
export type ClaimedJob<Payload> = Omit<ClaimedJobRow, 'payload'> & {
  rawPayload: string;
  payload: Payload;
};

/**
 * Per-type retry configuration. Requires at least one of `maxAgeMs` or `maxAttempts`.
 *
 * - `backoffMs(attempt)`: delay in milliseconds before the next attempt (`attempt` is 1-based).
 * - `maxAgeMs`: maximum age from `createdAt` before retries stop.
 * - `maxAttempts`: maximum claim attempt number allowed to run the handler.
 */
export type JobRetryPolicy = {
  backoffMs: (attempt: number) => number;
  maxAgeMs?: number;
  maxAttempts?: number;
} & ({ maxAgeMs: number } | { maxAttempts: number });

/** Per-type concurrency and backlog limits enforced by the worker and enqueue path. */
export type JobLimitsPolicy = {
  perGroupConcurrency?: number;
  perTenantConcurrency?: number;
  maxWaitingRowsPerGroup?: number;
};

/** Optional per-group circuit breaker configuration. */
export type JobCircuitBreakerPolicy = {
  failureThreshold: number;
};

/**
 * Outcome returned by {@link JobHandler.handle}.
 *
 * Optional `meta` is forwarded transparently to {@link JobQueueQueries.settle} so adapters (such as
 * Core's webhook delivery CTE) can couple auxiliary writes inside the same fenced DB statement.
 */
export type JobHandlerResult<SettlementMeta = never> =
  | { status: 'done'; meta?: SettlementMeta }
  | { status: 'retry'; retryAfterMs?: number; meta?: SettlementMeta }
  | { status: 'fail'; meta?: SettlementMeta };

/**
 * Explicit contract that every registered job type must implement.
 *
 * **Contract rule:** handlers must read secrets and mutable configuration (signing keys, endpoint
 * URLs, custom auth headers, enabled status) at execution time and never store them in
 * `jobs.payload`. The type check flags common top-level keys; the enqueue path must ensure the
 * actual persisted payload obeys this rule.
 */
export type JobHandler<Payload, SettlementMeta = never> = {
  type: string;
  parsePayload: (raw: string) => Payload;
  leaseMs: number;
  retry: JobRetryPolicy;
  limits?: JobLimitsPolicy;
  circuitBreaker?: JobCircuitBreakerPolicy;
  handle: (job: ClaimedJob<Payload>) => Promise<JobHandlerResult<SettlementMeta>>;
  onExhausted?: (job: ClaimedJob<Payload>, error?: unknown) => void | Promise<void>;
} & ForbiddenPayloadBrand<Payload>;

/** Type-checked helper for authoring {@link JobHandler} definitions. */
export const defineJobHandler = <Payload, SettlementMeta = never>(
  handler: JobHandler<Payload, SettlementMeta>
): JobHandler<Payload, SettlementMeta> => handler;

/** Per-type configuration sent to {@link JobQueueQueries.claimDue}. */
export type RegisteredJobTypeConfig = {
  type: string;
  leaseMs: number;
  perGroupConcurrency?: number;
  perTenantConcurrency?: number;
};

/**
 * Identifies a `(tenantId, type, groupKey)` partition (or `(type, groupKey)` when tenantless).
 */
export type JobGroup = {
  tenantId?: string;
  type: string;
  groupKey: string;
};

/** Remaining in-flight capacity for a `(tenantId, type)` pair that currently has active work. */
export type TenantRemainingSlots = {
  tenantId: string;
  type: string;
  remainingSlots: number;
};

/** Remaining in-flight capacity for a `(tenantId, type, groupKey)` partition. */
export type GroupRemainingSlots = JobGroup & {
  remainingSlots: number;
};

/**
 * Parameters supplied to {@link JobQueueQueries.claimDue} for fair batch claiming. Skip entries
 * with zero remaining slots before limiting the candidate window. Partitions absent from these
 * arrays use their handler's configured limits, or have no partition cap if unconfigured.
 */
export type ClaimDueInput = {
  workerId: string;
  limit: number;
  types: readonly RegisteredJobTypeConfig[];
  tenantRemainingSlots: readonly TenantRemainingSlots[];
  groupRemainingSlots: readonly GroupRemainingSlots[];
};

/** Final settlement instruction derived from {@link JobHandler.handle} and retry policy. */
export type SettleResolution =
  | { status: 'done' }
  | { status: 'retry'; delayMs: number; nextAttemptAt: number; error?: unknown }
  | { status: 'fail'; error?: unknown }
  | { status: 'exhausted'; error?: unknown };

/** Arguments passed to {@link JobQueueQueries.settle} for fenced settlement. */
export type SettleJobInput<SettlementMeta = unknown> = {
  job: ClaimedJobRow;
  workerId: string;
  resolution: SettleResolution;
  meta?: SettlementMeta;
};

/**
 * Outcome returned by {@link JobQueueQueries.settle}.
 *
 * - `'settled'`: fenced transition committed as requested.
 * - `'rearmed'`: newer work arrived mid-run (e.g. `revision` advanced on a convergence-mode row),
 *   so the row was re-queued as pending instead of terminating; `onExhausted` must not fire.
 * - `'stale'`: fencing check matched no row because another worker reclaimed the lease.
 */
export type SettleOutcome = 'settled' | 'rearmed' | 'stale';

/** Arguments passed to {@link JobQueueQueries.parkDueGroup} when a group circuit opens or steps. */
export type ParkDueGroupInput = {
  tenantId?: string;
  type: string;
  groupKey: string;
  nextAttemptAt: number;
  /**
   * Earliest creation timestamp whose retry window still covers `nextAttemptAt`, or `0` if there
   * is no cutoff. Mark older waiting rows as permanently failed instead of parking them past
   * their window. Do not touch live leases.
   * The adapter is responsible for any logs or metrics because bulk expiry skips `onExhausted`.
   */
  minCreatedAt: number;
};

/** Arguments passed to {@link JobQueueQueries.releaseClaimed} during shutdown. */
export type ReleaseClaimedInput = {
  workerId: string;
  jobs: readonly ClaimedJobRow[];
};

/** Database-agnostic query adapter implemented by each host (e.g., Core Slonik or Cloud withtyped). */
export type JobQueueQueries<SettlementMeta = unknown> = {
  claimDue: (input: ClaimDueInput) => Promise<readonly ClaimedJobRow[]>;
  settle: (input: SettleJobInput<SettlementMeta>) => Promise<SettleOutcome>;
  parkDueGroup?: (input: ParkDueGroupInput) => Promise<number | void>;
  /** Return the number of rows actually released when the adapter can report it. */
  releaseClaimed?: (input: ReleaseClaimedInput) => Promise<number | void>;
};
