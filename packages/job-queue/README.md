# `@logto/job-queue`

Shared, database-agnostic job queue engine and handler contract used by Logto services (such as `@logto/core` via Slonik and Cloud workers via `@withtyped/postgres`).

## Architecture

- **DB-agnostic query adapter (`JobQueueQueries<SettlementMeta>`)**: Separates claim, fenced settlement, group parking, and shutdown release SQL queries from the consumer loop, concurrency limits, backoff state machine, and circuit-breaker tracking.
- **Explicit handler contract (`JobHandler<Payload, SettlementMeta>`)**: Each job `type` declares its `parsePayload`, per-type `leaseMs`, retry schedule (`backoffMs`, `maxAgeMs`, optional `maxAttempts`), concurrency and waiting-row caps (`limits`), optional `circuitBreaker`, `handle(job)` returning `done | retry | fail` (with optional `SettlementMeta` passed straight to `queries.settle`), and optional `onExhausted`.
- **Fencing**: Settlement carries the claimed row and `workerId` so adapters fence updates and deletes on `(id, tenant_id, claimed_by, attempts)` (coupling auxiliary writes such as audit log upserts into the same CTE).
- **Consumer & shutdown**: Single-flight wake coalescing (`wake()`), 5-second default poll interval, per-instance / per-tenant / per-group concurrency tracking, per-process `workerId` via `generateStandardId()` (never `process.pid`), `stop()` drain + batch release, and `installGracefulShutdown`.

## Handler Contract Rule: No Secrets or Mutable Config in Payloads

Handlers **must** read secrets and mutable configuration (signing keys, endpoint URLs, custom auth headers, credentials, enabled status) at execution time and **never** store them in `jobs.payload`.

- Keeping secrets out of `jobs.payload` avoids persisting sensitive credentials in queue rows.
- Reading configuration at execution time ensures disabling, deleting, or rotating a target takes effect immediately for pending retries.
- `SafeJobPayload<Payload>` enforces this rule at compile time for common secret/configuration property names (`ForbiddenJobPayloadKey`).
