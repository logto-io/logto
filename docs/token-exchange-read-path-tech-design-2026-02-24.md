# Token Exchange Read-Path Performance Design

Date: 2026-02-24  
Owner: Core/OIDC

## 1. Objective

Reduce token exchange latency by optimizing read-path operations in the token exchange execution flow.

This design focuses only on validation/query/context assembly costs:

- access and subject-token validation
- account lookup
- resource server info resolution and scope derivation

## 2. Current state

Recent measurements show token exchange is in a low-latency range (`28-43ms`), but read-path still contains stable and tail-heavy hotspots:

- `validateTokenExchangeAccessMs`: ~`2ms`
- `validateSubjectTokenMs`: `1-2ms`
- `findAccountMs`: `2-11ms` (tail jitter)
- `getResourceServerInfoMs`: `9-15ms` (consistently high share)

Implication: read-path optimization is a high-ROI lever for reducing average and tail latency, and for creating room for subsequent write-path gains.

## 3. Current read flow and code facts

Token exchange read flow is implemented in:

- `packages/core/src/oidc/grants/token-exchange/index.ts`

Key sequence in the hot path:

1. `validateTokenExchangeAccess(...)`
2. `validateSubjectToken(...)`
3. `Account.findAccount(ctx, userId)` (`findAccountMs`)
4. `resolveResource(...)`
5. `resourceIndicators.getResourceServerInfo(ctx, resource, client)` (`getResourceServerInfoMs`)

Resource server resolution internals are configured in:

- `packages/core/src/oidc/init.ts` (`features.resourceIndicators.getResourceServerInfo`)

Measured sub-steps already include:

- `findResourceMs`
- `findResourceScopesMs`
- `checkThirdPartyApplicationMs`
- `filterResourceScopesMs`

These sub-steps indicate multi-query scope derivation and permission filtering in the critical path.

## 4. Design goals and constraints

## Goals

- Bring `getResourceServerInfoMs` p50 down to `<= 3ms` on warm path.
- Bring `findAccountMs` p95 down to `<= 4ms`.
- Reduce DB round trips and smooth p95/p99 latency.
- Preserve authorization correctness (resource/organization/third-party behavior unchanged).

## Non-goals

- Write-path persistence optimization
- HTTP/network latency optimization
- Functional changes to token exchange semantics

## Constraints

- Multi-tenant correctness and isolation
- Compatibility with current OIDC-provider integration points
- No correctness dependence on local-only cache behavior

## 5. Proposed solution

## A. Cache `getResourceServerInfo` with short TTL (primary optimization)

### Idea

Cache resource server info results for token exchange using short TTL plus strict keying.

### Suggested key dimensions

- `tenantId`
- `clientId`
- `resourceIndicator`
- subject dimension (`userId` for user subject, app id for app subject)
- optional `organizationId` when present

### Why this helps

`getResourceServerInfoMs` is currently `9-15ms`; warm-cache target is `1-3ms`.

### Design details

- Start with TTL-only (`5-15s`) to ship quickly.
- Use single-flight deduplication per key to prevent stampede.
- Cache failures must fail-open to DB path (never fail request due to cache backend errors).

## B. Add token-exchange fast path for account lookup (secondary optimization)

### Idea

Avoid full account payload fetch in token exchange hot path when only account existence/identifier is required.

### Why this helps

`findAccountMs` has visible tail (`2-11ms`). A minimal projection/existence path plus tiny TTL cache can reduce p95 jitter.

### Design details

- Introduce token-exchange-specific account lookup with minimal selected fields.
- Keep default OIDC `findAccount` behavior unchanged for other grants.
- Optional short TTL (`3-10s`) for account existence result.

## C. Reduce scope-derivation query round trips (third optimization)

### Idea

Optimize `getResourceServerInfo` internals by reducing sequential DB calls and validating index coverage for frequent predicates.

### Candidate actions

- consolidate role/scope/resource filtering queries where safe,
- avoid repeated third-party app checks in the same request path,
- validate indexes for resource indicator and relation joins.

### Expected impact

Additional p95/p99 reduction after cache and account fast path are in place.

## D. Strengthen branch short-circuiting (opportunistic)

### Idea

Ensure organization/actor-specific reads are only executed when corresponding parameters are present and required.

### Expected impact

Small but consistent reduction in unnecessary reads.

## 6. Implementation plan

## Phase 1: Observability baseline

- Keep/extend read-path timing metrics:
  - `findAccountMs`
  - `getResourceServerInfoMs` and sub-steps
- Add per-request DB query count and DB time aggregation.
- Add cache metrics:
  - hit/miss/error counters
  - key-cardinality visibility

Exit criteria:

- Stable baseline available for p50/p95/p99 across 200+ request runs.

## Phase 2: Resource server info cache

- Implement cache and single-flight around `getResourceServerInfo`.
- Roll out with TTL-only invalidation first.

Exit criteria:

- `getResourceServerInfoMs` p50 `<= 3ms`
- no correctness regressions in scope/permission outcomes.

## Phase 3: Account fast path

- Implement token-exchange-specific minimal account lookup.
- Add optional short TTL existence cache if needed.

Exit criteria:

- `findAccountMs` p95 `<= 4ms`
- no regressions for deleted/missing account behavior.

## Phase 4: Query consolidation and index tuning

- Optimize scope-derivation query plan.
- Validate before/after query count and latency.

Exit criteria:

- measurable additional p95/p99 reduction,
- no permission calculation mismatches.

## 7. Correctness and risk analysis

## Key risks

1. Authorization staleness window caused by caching.
2. Incomplete cache key dimensions causing cross-context leakage.
3. Multi-instance cache inconsistency in distributed deployments.
4. Query refactors introducing subtle permission mismatches.

## Mitigations

1. Use short TTL first and explicit invalidation expansion in later stages.
2. Keep key dimensions strict and test matrix broad.
3. Prefer shared cache backend or cluster-wide invalidation as follow-up.
4. Add golden tests for permission outcomes across resource/organization/third-party combinations.

## 8. Testing and verification plan

## Functional tests

- token exchange success paths:
  - with/without `resource`
  - with/without `organization_id`
  - third-party and first-party applications
- failure paths:
  - invalid subject token
  - invalid client
  - missing/deleted account
- scope correctness:
  - returned token scopes match expected filtered scopes

## Performance tests

- same payload, 200+ sequential requests
- same payload, concurrent requests at multiple load levels
- compare before/after on:
  - `findAccountMs`
  - `getResourceServerInfoMs` (+ sub-steps)
  - `token_exchange_total_ms`
  - per-request DB query count
  - cache hit ratio

## Acceptance targets

- `getResourceServerInfoMs` p50 `<= 3ms`
- `findAccountMs` p95 `<= 4ms`
- read-path contribution in token exchange latency is materially reduced
- no authorization correctness regressions

## 9. Rollout strategy

1. Ship observability first.
2. Ship resource info cache behind feature flag.
3. Canary rollout and compare latency + correctness metrics.
4. Enable account fast path in staged rollout.
5. Execute query consolidation only if post-phase metrics still justify it.
6. Keep rollback path via feature flags.

## 10. Open questions

1. Should cache invalidation be TTL-only in initial production rollout, or include write-event invalidation from day 1?
2. What is the acceptable authorization staleness window for production tenants?
3. Should account fast path be token-exchange-only, or generalized across grants after validation?
4. At what measured threshold do we proceed to query consolidation work?

## 11. Expected outcome

This design targets the highest read-path ROI first: reducing stable `getResourceServerInfo` latency and `findAccount` tail jitter while preserving authorization correctness.  
With phased rollout, feature flags, and strict verification, it should provide measurable token exchange latency improvements and a safer path to further optimizations.
