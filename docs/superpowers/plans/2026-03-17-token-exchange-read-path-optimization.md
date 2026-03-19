# Token Exchange Read-Path Optimization Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce token exchange latency by caching `getResourceServerInfo` results and eliminating redundant DB queries within a single request.

**Architecture:** Create an `OidcCache` class (extending `BaseCache`) with a 10s TTL to cache resource server info. Short-circuit redundant `isThirdPartyApplication` calls by propagating the result as a parameter. Optionally consolidate scope-derivation queries for user+organization path.

**Tech Stack:** TypeScript, oidc-provider, Redis (via `BaseCache`), Zod, Jest

**Spec:** `docs/token-exchange-read-path-tech-design-2026-02-24.md`

**Scope note:** The spec's optimization D (full `TokenExchangeContext` object for request-scoped dedup) is intentionally scoped down to only `isThirdParty` propagation (Task 4). The general-purpose context object can be added later if more fields need deduplication.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `packages/core/src/caches/oidc.ts` | OidcCache class extending BaseCache |
| Modify | `packages/core/src/oidc/init.ts` | Create OidcCache internally, wrap `getResourceServerInfo` with memoize |
| Modify | `packages/core/src/oidc/grants/utils.ts` | Accept optional `isThirdParty` in `checkOrganizationAccess` |
| Modify | `packages/core/src/oidc/grants/token-exchange/index.ts` | Resolve `isThirdParty` once, pass downstream |

---

## Task 1: Create `OidcCache` class

**Files:**
- Create: `packages/core/src/caches/oidc.ts`

The cached value is the return type of `getResourceServerInfo`:
```typescript
{ accessTokenFormat: 'jwt', jwt: { sign: { alg: string } }, accessTokenTTL: number, scope: string }
```

- [ ] **Step 1: Create the cache class**

Create `packages/core/src/caches/oidc.ts`:

```typescript
import { type ZodType, z } from 'zod';

import { BaseCache } from './base-cache.js';

/**
 * The cached result shape returned by `getResourceServerInfo` in the OIDC provider configuration.
 * Contains resource server metadata with resolved scope string.
 */
export type ResourceServerInfo = {
  accessTokenFormat: string;
  jwt: { sign: { alg: string } };
  accessTokenTTL: number;
  scope: string;
};

const resourceServerInfoGuard = z.object({
  accessTokenFormat: z.string(),
  jwt: z.object({ sign: z.object({ alg: z.string() }) }),
  accessTokenTTL: z.number(),
  scope: z.string(),
});

type OidcCacheMap = {
  'resource-server-info': ResourceServerInfo;
};

type OidcCacheType = keyof OidcCacheMap;

// See https://github.com/microsoft/TypeScript/issues/27808#issuecomment-1207161877
// Overload signature is required for TypeScript to properly narrow the return type.
function getValueGuard<Type extends OidcCacheType>(type: Type): ZodType<OidcCacheMap[Type]>;

function getValueGuard(type: OidcCacheType): ZodType<OidcCacheMap[typeof type]> {
  switch (type) {
    case 'resource-server-info': {
      return resourceServerInfoGuard;
    }
  }
}

/**
 * Cache for OIDC token exchange read-path operations.
 * Caches resource server info (scopes, TTL) with short TTL to reduce DB round trips.
 */
export class OidcCache extends BaseCache<OidcCacheMap> {
  name = 'OIDC';
  getValueGuard = getValueGuard;
}
```

- [ ] **Step 2: Verify the module compiles**

Run: `cd packages/core && pnpm build 2>&1 | head -20`
Expected: no errors related to `caches/oidc.ts`

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/caches/oidc.ts
git commit -m "feat(core): add OidcCache class for token exchange read-path caching"
```

---

## Task 2: Cache `getResourceServerInfo` with `memoize()`

**Files:**
- Modify: `packages/core/src/oidc/init.ts:67-74,155-200`

The `getResourceServerInfo` callback is an inline function in the OIDC provider config. We will:
1. Create `OidcCache` inside `initOidc` using the module-level `redisCache` import (avoids modifying `Tenant` constructor's default-initializer chain)
2. Extract the core logic into a standalone function whose arguments form the cache key
3. Wrap it with `oidcCache.memoize()` using 10s TTL
4. Call the memoized version from the original callback

**Cache key design:**
The full cache key (including BaseCache prefix) is: `{tenantId}:resource-server-info:{indicator}:{clientId}:{userId}:{organizationId}`

Why `subjectType` is not a separate dimension: when `userId` is present, `findResourceScopes` uses the user path; when absent (value `-`), it falls through to the application path using `clientId` as `applicationId`. The presence/absence of `userId` in the key implicitly differentiates the two paths.

**Important context:**
- The current function is at `packages/core/src/oidc/init.ts` lines 155-200
- It receives `(ctx, indicator)` from oidc-provider
- It extracts `client`, `userId`, `organizationId` from `ctx.oidc`
- It calls `findResource`, `findResourceScopes`, `isThirdPartyApplication`, and optionally `filterResourceScopesForTheThirdPartyApplication`

- [ ] **Step 1: Add imports**

In `packages/core/src/oidc/init.ts`, add:

```typescript
import { OidcCache } from '#src/caches/oidc.js';
import { redisCache } from '#src/caches/index.js';
```

- [ ] **Step 2: Define the core function and memoized wrapper**

Inside `initOidc`, after the existing destructuring (around line 79, after `const { resources: { findDefaultResource }, ... } = queries;`) and before `const oidc = new Provider(...)` (around line 92), add:

```typescript
const oidcCache = new OidcCache(tenantId, redisCache);

const resourceServerInfoCacheTtlSeconds = 10;

/**
 * Core logic for resolving resource server info. Arguments are explicit values
 * (not ctx) so the function can be wrapped with memoize().
 */
const getResourceServerInfoCore = async (
  indicator: string,
  clientId: string | undefined,
  userId: string | undefined,
  organizationId: string | undefined
) => {
  const resourceServer = await findResource(queries, indicator);

  if (!resourceServer) {
    throw new errors.InvalidTarget();
  }

  const { accessTokenTtl: accessTokenTTL } = resourceServer;

  const scopes = await findResourceScopes({
    queries,
    libraries,
    indicator,
    findFromOrganizations: true,
    organizationId,
    applicationId: clientId,
    userId,
  });

  if (clientId && (await isThirdPartyApplication(queries, clientId))) {
    const filteredScopes = await filterResourceScopesForTheThirdPartyApplication(
      libraries,
      clientId,
      indicator,
      scopes
    );

    return {
      ...getSharedResourceServerData(envSet),
      accessTokenTTL,
      scope: filteredScopes.map(({ name }) => name).join(' '),
    };
  }

  return {
    ...getSharedResourceServerData(envSet),
    accessTokenTTL,
    scope: scopes.map(({ name }) => name).join(' '),
  };
};

const getResourceServerInfoCached = oidcCache.memoize(
  getResourceServerInfoCore,
  [
    'resource-server-info',
    (indicator, clientId, userId, organizationId) =>
      [indicator, clientId ?? '-', userId ?? '-', organizationId ?? '-'].join(':'),
  ],
  () => resourceServerInfoCacheTtlSeconds
);
```

- [ ] **Step 3: Replace the inline getResourceServerInfo body**

Replace the current `getResourceServerInfo` callback (lines ~155-200) with a thin wrapper that extracts ctx dimensions and delegates to the cached function:

```typescript
getResourceServerInfo: async (ctx, indicator) => {
  const { client, params, session, entities } = ctx.oidc;
  const userId = session?.accountId ?? entities.Account?.accountId;
  const organizationId = params?.organization_id;

  return getResourceServerInfoCached(
    indicator,
    client?.clientId,
    userId,
    typeof organizationId === 'string' ? organizationId : undefined
  );
},
```

- [ ] **Step 4: Handle InvalidTarget error correctly**

Note: `InvalidTarget` is thrown by the core function when `findResource` returns null. The `memoize()` wrapper uses `trySafe` for cache get/set operations but does NOT catch errors from the wrapped function — errors propagate normally. So `InvalidTarget` will still be thrown to the caller. **Also note: errors are NOT cached** — the memoize wrapper only caches successful results (the `set` call at line 158 of `base-cache.ts` is reached only after `run.apply()` succeeds).

- [ ] **Step 5: Verify compilation**

Run: `cd packages/core && pnpm build 2>&1 | head -20`
Expected: no errors

- [ ] **Step 6: Verify existing tests pass**

Run: `cd packages/core && pnpm test 2>&1 | tail -20`
Expected: all existing tests pass (client-credentials.test.ts, refresh-token.test.ts)

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/oidc/init.ts
git commit -m "feat(core): cache getResourceServerInfo with 10s TTL via OidcCache.memoize()"
```

---

## Task 3: Short-circuit `isThirdPartyApplication` in token exchange flow

**Files:**
- Modify: `packages/core/src/oidc/grants/utils.ts:97-153`
- Modify: `packages/core/src/oidc/grants/token-exchange/index.ts:60,94`

In the token exchange flow, `isThirdPartyApplication` is called in `checkOrganizationAccess` (utils.ts:125). After Task 2, the call inside `getResourceServerInfo` is eliminated by caching. But `checkOrganizationAccess` still makes its own DB call.

The optimization: resolve `isThirdParty` once in the token exchange handler and pass it to `checkOrganizationAccess`.

Note: `resource.ts` is NOT modified — `isThirdPartyApplication` is imported as-is from `../../resource.js`.

- [ ] **Step 1: Add optional `isThirdParty` parameter to `checkOrganizationAccess`**

In `packages/core/src/oidc/grants/utils.ts`, change the function signature (line 97-101):

```typescript
export const checkOrganizationAccess = async (
  ctx: KoaContextWithOIDC,
  queries: Queries,
  account: Account,
  isThirdParty?: boolean
): Promise<{ organizationId?: string }> => {
```

Then update the usage at line 124-125:

Replace:
```typescript
    if (
      (await isThirdPartyApplication(queries, client.clientId)) &&
```

With:
```typescript
    if (
      (isThirdParty ?? (await isThirdPartyApplication(queries, client.clientId))) &&
```

- [ ] **Step 2: Resolve `isThirdParty` early in token exchange handler**

In `packages/core/src/oidc/grants/token-exchange/index.ts`, add import:

```typescript
import { isThirdPartyApplication } from '../../resource.js';
```

After the `assertThat(client, ...)` check (line 60), add:

```typescript
const isThirdParty = await isThirdPartyApplication(queries, client.clientId);
```

Then update the `checkOrganizationAccess` call (line 94):

```typescript
const { organizationId } = await checkOrganizationAccess(ctx, queries, account, isThirdParty);
```

- [ ] **Step 3: Verify compilation**

Run: `cd packages/core && pnpm build 2>&1 | head -20`
Expected: no errors

- [ ] **Step 4: Verify existing tests pass**

Run: `cd packages/core && pnpm test 2>&1 | tail -20`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/oidc/grants/utils.ts packages/core/src/oidc/grants/token-exchange/index.ts
git commit -m "feat(core): short-circuit isThirdPartyApplication in token exchange flow"
```

---

## Task 4: Consolidate scope-derivation queries for user + organization path (Optional)

**Files:**
- Modify: `packages/core/src/oidc/resource.ts:34-96` (`findResourceScopes`)
- Investigate: the `findUserScopesForResourceIndicator` library function to understand query structure

This task addresses optimization C from the tech design: when `userId` and `organizationId` are both present, `findResourceScopes` calls `findUserScopesForResourceIndicator(userId, indicator, true, organizationId)` which may internally make 2 sequential queries (user role scopes + organization role resource scopes).

**Prerequisites:**
- Tasks 1-3 are complete and stable
- Profiling data confirms this path has >= 2 sequential scope queries
- The `findUserScopesForResourceIndicator` implementation has been reviewed

- [ ] **Step 1: Read `findUserScopesForResourceIndicator` implementation**

Locate the function in `packages/core/src/libraries/user.*.ts` or similar. Read the full implementation to understand:
- How many DB queries it makes when `findFromOrganizations=true` and `organizationId` is set
- Whether the queries can be safely combined with UNION

- [ ] **Step 2: If queries can be combined, implement a combined query**

Add a new method (e.g., `findUserScopesForResourceIndicatorCombined`) that uses a single SQL UNION query:

```sql
SELECT DISTINCT s.id, s.name FROM users_roles ur
  JOIN roles_scopes rs ON rs.role_id = ur.role_id
  JOIN scopes s ON s.id = rs.scope_id
  WHERE ur.user_id = $1 AND s.resource_id IN (SELECT id FROM resources WHERE indicator = $2)
UNION
SELECT DISTINCT s.id, s.name FROM organization_user_roles our
  JOIN organization_role_resource_scopes orrs ON orrs.organization_role_id = our.organization_role_id
  JOIN scopes s ON s.id = orrs.scope_id
  WHERE our.user_id = $1 AND our.organization_id = $3 AND s.resource_id IN (SELECT id FROM resources WHERE indicator = $2)
```

Note: The exact SQL depends on the actual schema. Validate column names and table names against the database schema before implementing.

- [ ] **Step 3: Validate query plan**

Run `EXPLAIN ANALYZE` on the combined query to confirm index usage and that it's faster than 2 sequential queries.

- [ ] **Step 4: Wire it into `findResourceScopes`**

In `packages/core/src/oidc/resource.ts`, when `userId` and `organizationId` are both present, call the combined query instead of `findUserScopesForResourceIndicator`.

- [ ] **Step 5: Verify compilation and tests**

Run: `cd packages/core && pnpm build && pnpm test`

- [ ] **Step 6: Commit**

```bash
git add <changed files>
git commit -m "feat(core): consolidate user+org scope queries into single UNION query"
```

---

## Verification Checklist

After completing Tasks 1-3 (or 1-4):

- [ ] `cd packages/core && pnpm build` succeeds
- [ ] `cd packages/core && pnpm test` passes all existing tests
- [ ] Manual test: token exchange with resource → returns correct scopes (warm cache should be faster on 2nd call)
- [ ] Manual test: token exchange with organization_id → returns correct org scopes
- [ ] Manual test: token exchange with third-party app → scopes are properly filtered
- [ ] Manual test: change a role's scopes via management API → after 10s, token exchange reflects new scopes (cache expiry)
