# Token Exchange Write-Path Performance Design

Date: 2026-02-24  
Owner: Core/OIDC

## 1. Objective

Reduce token exchange latency by optimizing write operations in the grant issuance path.

This design focuses only on persistence-related latency inside token exchange execution:

- `grant.save()` (initial and final)
- `accessToken.save()`
- `oidc.adapter.upsert` / DB upsert cost for OIDC model instances

## 2. Current state

Recent measurements show token exchange can be in a low-latency range (`28-43ms`), but write operations still take a large portion of total cost:

- `grantSaveInitialMs`: `5-9ms`
- `grantSaveFinalMs`: `4-5ms`
- `accessTokenSaveMs`: `4-5ms`
- Combined write path: `13-19ms`

Implication: with the current two-save grant pattern, write path alone is close to or above the target budget for aggressive low-latency goals.

## 3. Current write flow and code facts

Token exchange write flow is implemented in:

- `packages/core/src/oidc/grants/token-exchange/index.ts`

Current sequence:

1. Create `Grant`
2. `grant.save()` to obtain `grantId`
3. Build and mutate grant scopes and access token fields
4. `grant.save()` again
5. `accessToken.save()`

Adapter write path:

- `packages/core/src/oidc/adapter.ts` (`upsert`)
- `packages/core/src/queries/oidc-model-instance.ts` (`upsertInstance`, conflict-update on `(tenantId, modelName, id)`)

Each `save()` triggers a model upsert, so the current flow performs three persistence writes in the hot path.

## 4. Design goals and constraints

## Goals

- Remove at least one persistence round trip from token exchange write path.
- Keep revocation semantics unchanged (grant-based revocation must continue to work).
- Keep behavior consistent for organization/resource/actor token exchange scenarios.
- Provide model-level observability to prove improvements.

## Non-goals

- Read-path optimization
- HTTP/network latency optimization
- Behavior changes to token model contracts beyond this grant flow

## Constraints

- Compatibility with `oidc-provider` Grant and AccessToken semantics
- No regression in revoke-by-grant-id behavior
- No dependency on cross-request in-memory state for correctness

## 5. Proposed solution

## A. Collapse double `grant.save()` into single `grant.save()` (primary optimization)

### Idea

Generate/stabilize `grantId` before persistence, so we can:

1. Build full grant + access token state in memory
2. Execute one `grant.save()`
3. Execute one `accessToken.save()`

### Why this helps

Removes one DB upsert from the hot path. Based on current measurements, expected direct gain is approximately `4-9ms` per request.

### Design details

- Introduce a deterministic grant ID generation step before final persistence.
- Ensure the generated ID is exactly the value used by persisted Grant and referenced by AccessToken `grantId`.
- Keep write order as `grant.save()` then `accessToken.save()` to preserve dependency and simplify rollback semantics.

### Compatibility checks required

- Verify that pre-setting grant identifier is supported by current `oidc-provider` Grant model behavior.
- Verify revoke-by-grant-id still revokes all associated tokens.
- Verify no difference in downstream payload fields used by introspection/revocation.

## B. Add model-level write observability (required before and after optimization)

### Idea

Instrument `oidc.adapter.upsert` latency and payload size by model type (`Grant`, `AccessToken`, others).

### Metrics

- `oidc_adapter_upsert_ms{model}`
- `oidc_adapter_upsert_payload_bytes{model}`
- `oidc_adapter_upsert_error_count{model}`

### Why this is required

Current timings in token exchange are step-level and cannot isolate adapter/DB cost by model. Model-level metrics are required to:

- validate that single-save grant reduces writes in practice,
- identify whether AccessToken upsert becomes the next bottleneck,
- guard against hidden regressions under load.

## C. Optimize write payload and DB upsert efficiency (secondary optimization)

### Idea

Reduce serialization and update overhead in OIDC model upsert:

- trim non-essential payload fields where safe,
- avoid unnecessary object growth before save,
- validate index and query plan health for `oidc_model_instances` writes.

### Candidate actions

- audit payload diff between first and second grant save to ensure the removed write is truly redundant,
- benchmark JSON payload size and serialization cost for Grant and AccessToken,
- verify table/index health and conflict-update cost under write concurrency.

### Expected impact

Additional `1-4ms` average gain, mainly p95 stabilization under sustained load.

## 6. Implementation plan

## Phase 1: Observability baseline

- Add adapter-level write metrics in `packages/core/src/oidc/adapter.ts`.
- Capture baseline for:
  - current double-grant-save path
  - p50/p95/p99 of grant and access token writes

Exit criteria:

- Metrics available in dashboards and test logs.
- Baseline reproduced with 200+ repeated requests.

## Phase 2: Single-grant-save implementation

- Refactor token exchange grant flow to construct complete grant state before persistence.
- Replace two `grant.save()` calls with one.
- Keep access token save after grant save.

Exit criteria:

- One fewer write observed in request-level traces.
- `grantSave*` total reduced significantly.
- No behavior regressions.

## Phase 3: Payload and adapter tuning

- Run payload/serialization audit.
- Apply safe payload and adapter-level optimizations.
- Benchmark under concurrent token exchange load.

Exit criteria:

- Additional measurable p95 reduction without correctness regressions.

## 7. Correctness and risk analysis

## Key risks

1. Grant identifier mismatch between in-memory token and persisted grant.
2. Revocation behavior regression if grant linkage changes.
3. Hidden assumptions in `oidc-provider` Grant lifecycle.
4. Concurrency edge cases under high-frequency exchanges for the same account/client.

## Mitigations

1. Add integration tests that validate grant ID linkage and revoke-by-grant-id behavior.
2. Keep write ordering deterministic and unchanged except removed redundant save.
3. Use feature flag to gate rollout and allow immediate rollback.
4. Run concurrency tests with repeated exchanges and verify token validity/revocation consistency.

## 8. Testing and verification plan

## Functional tests

- Token exchange success cases:
  - with resource
  - with organization
  - with actor token
- Failure cases:
  - invalid subject token
  - invalid client
- Revocation:
  - revoke by grant ID invalidates associated tokens as before

## Performance tests

- Same payload, 200+ sequential requests
- Same payload, concurrent requests (at least 3 load levels)
- Compare before/after on:
  - `grantSaveInitialMs`, `grantSaveFinalMs`, `accessTokenSaveMs`
  - `token_exchange_total_ms`
  - adapter model upsert metrics

## Acceptance targets

- Remove one grant persistence write from token exchange path.
- Write-path total reduction by at least `4ms` on p50.
- No p95 regression for `accessTokenSaveMs`.
- No behavioral regression in revoke or token issuance semantics.

## 9. Rollout strategy

1. Ship metrics first.
2. Ship single-grant-save behind a feature flag.
3. Enable in canary tenant(s), compare p50/p95/p99 and error rates.
4. Gradually increase rollout scope.
5. Keep fast rollback path by disabling feature flag.

## 10. Open questions

1. Should grant ID generation be explicit in token exchange logic or encapsulated in adapter/model utility?
2. Do we need transaction-level grouping for grant+accessToken writes, or is current ordering sufficient for consistency requirements?
3. Is there any downstream consumer relying on intermediate first-save Grant state today?

## 11. Expected outcome

This design targets the highest write-path ROI first: removing one Grant persistence operation while preserving protocol behavior and revocation correctness.  
With instrumentation and phased rollout, it provides measurable latency gain and controlled risk for production adoption.
