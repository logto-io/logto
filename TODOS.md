# TODOS

## Core

### Add revision-based authz cache if token exchange is still hot after Phase 1

**What:** Add a revision-based cache for effective authorization results such as resolved resource scopes, instead of reintroducing a TTL-based aggregate OIDC cache.

**Why:** Phase 1 removes a stale-data-prone aggregate cache and keeps only the safe resource projection cache. If token exchange is still a measurable hotspot after that change, the next optimization needs a provable invalidation model.

**Context:** This came out of the `/plan-eng-review` for branch `chore/core-token-exchange-timing-log`. The current plan is intentionally scoped down to: remove the standalone OIDC aggregate cache, cache only the minimal resource projection used by OIDC, and add invalidation plus regression tests. If profiling still shows scope resolution as a bottleneck after that lands, the follow-up should key authz caches by a tenant or authz revision so writes make old entries unreachable. Do not reintroduce a short-TTL aggregate cache at the OIDC layer.

**Effort:** L
**Priority:** P3
**Depends on:** Phase 1 cache rollback landing and profiling showing token exchange remains materially hot

## Completed
