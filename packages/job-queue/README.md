# `@logto/job-queue`

Shared, database-agnostic job queue engine and handler contract used by Logto services (`@logto/core` via Slonik over its `jobs` table, and Cloud workers via `@withtyped/postgres` over Cloud's convergence-mode `cross_pod_jobs` table).

## Architecture

- **DB-agnostic query adapter (`JobQueueQueries<SettlementMeta>`)**: Separates claim, fenced settlement, group parking, and shutdown release SQL queries from the consumer loop, concurrency limits, backoff state machine, and circuit-breaker tracking. Each host supplies its own adapter over its own table rather than sharing Core's `jobs` table.
- **Explicit handler contract (`JobHandler<Payload, SettlementMeta>`)**: Each job `type` declares its `parsePayload`, per-type `leaseMs`, retry schedule (`backoffMs` plus at least one of `maxAgeMs` or `maxAttempts`), optional concurrency and waiting-row caps (`limits`), optional `circuitBreaker`, `handle(job)` returning `done | retry | fail` (with optional `SettlementMeta` passed straight to `queries.settle`), and optional `onExhausted`.
- **Settlement outcomes (`SettleOutcome`)**: `queries.settle` returns `'settled' | 'rearmed' | 'stale'`. `'settled'` commits the requested transition (allowing `onExhausted` when exhausted); `'rearmed'` indicates newer work arrived mid-run (e.g., a `revision` advance on `cross_pod_jobs`) so the row was re-queued as pending instead of terminating, suppresses `onExhausted`, and immediately wakes the worker; `'stale'` indicates another worker reclaimed the lease.
- **Tenantless & multi-tenant queues**: `ClaimedJobRow.tenantId` and `limits` (`perGroupConcurrency`, `perTenantConcurrency`, `maxWaitingRowsPerGroup`) are optional so tenantless adapters such as Cloud's `cross_pod_jobs` share the same engine alongside tenant-scoped queues.
- **Fencing**: Settlement carries the claimed row and `workerId` so adapters fence updates and deletes on `(id, claimed_by, attempts)` (plus `tenant_id` where applicable, coupling auxiliary writes such as audit log upserts into the same CTE).
- **Consumer & shutdown**: Single-flight wake coalescing (`wake()`), an independent 5-second default poll, per-instance / per-tenant / per-group concurrency tracking, and per-process `workerId` via `generateStandardId()` (never `process.pid`). Call `stop()` to drain and release claims. Set the drain deadline in `installGracefulShutdown` and call `releaseClaimed()` from `onDrainTimeout` before closing database pools.

## Handler Contract Rule: No Secrets or Mutable Config in Payloads

Handlers **must** read secrets and mutable configuration (signing keys, endpoint URLs, custom auth headers, credentials, enabled status) at execution time and **never** store them in `jobs.payload`.

- Keeping secrets out of `jobs.payload` avoids persisting sensitive credentials in queue rows.
- Reading configuration at execution time ensures disabling, deleting, or rotating a target takes effect immediately for pending retries.
- `SafeJobPayload<Payload>` catches common top-level secret/configuration keys on typed object payloads. It cannot check nested fields, strings, or what is stored; the enqueue path must enforce the rule for the actual persisted payload.
