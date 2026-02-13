# Token Exchange Single-Save Grant Implementation Design

Date: 2026-03-17
Owner: Core/OIDC

## 1. Objective

Eliminate one DB write from the token exchange hot path by pre-generating the grant ID and collapsing the current double `grant.save()` into a single persistence call.

This is the concrete implementation of "Solution A" from the write-path tech design (`token-exchange-write-path-tech-design-2026-02-24.md`).

## 2. Current state

The token exchange grant handler performs two `grant.save()` calls:

1. **Initial save** (`grantSaveInitialMs`: `5-9ms`): Creates the grant record in DB solely to obtain a `grantId`.
2. **Final save** (`grantSaveFinalMs`: `4-5ms`): Updates the same record with resource/organization scopes added via `grant.addResourceScope()`.

The first save exists only because `AccessToken` construction requires a `grantId`, and the current code obtains it from the return value of `grant.save()`.

Combined, the double save accounts for `9-14ms` of write-path latency per request.

## 3. Code-level feasibility analysis

### oidc-provider BaseModel supports pre-assigned `jti`

`oidc-provider/lib/models/base_model.js`:

```javascript
constructor({ jti, kind, ...payload } = {}) {
  // ...
  this.jti = jti;
}

async save(ttl) {
  if (!this.jti) {
    this.jti = this.generateTokenId();
  }
  // ...
  await this.adapter.upsert(this.jti, payload, ttl);
  return value; // === this.jti for opaque format
}
```

Key facts:

- If `jti` is passed in the constructor, `save()` uses it directly without generating a new one.
- The adapter `upsert` uses `INSERT ... ON CONFLICT (tenant_id, model_name, id) DO UPDATE`, so a pre-generated ID works identically.
- Grant uses opaque format: `save()` returns `this.jti`.

### No code between the two saves depends on the grant existing in DB

Between the first and second `grant.save()` in the current flow, the following operations execute:

- `new AccessToken(...)` — in-memory construction, only needs `grantId` value, not DB record
- `handleDPoP(ctx, accessToken)` — in-memory DPoP proof validation
- `handleClientCertificate(ctx, accessToken)` — in-memory mTLS binding
- `resolveResource(ctx, ...)` — reads resource indicator config, does not query grants
- `getResourceServerInfo(ctx, ...)` — reads resource server metadata (cached), does not query grants
- `getOrganizationUserScopes(...)` — reads org role/scope data, does not query grants
- `grant.addResourceScope(...)` — in-memory mutation on the Grant instance

None of these operations read the grant from the database. Removing the first save is safe.

## 4. Proposed change

### Pre-generate grant ID using `nanoid()`

```typescript
import { nanoid } from 'nanoid';

const grantId = nanoid();
const grant = new Grant({
  jti: grantId,
  accountId: account.accountId,
  clientId: client.clientId,
});
```

### Remove the first `grant.save()`

The `grantId` is now available immediately after Grant construction. The AccessToken can reference it without any DB call.

### Keep the single final `grant.save()` unchanged

After all scope resolution and `grant.addResourceScope()` calls, the existing final `grant.save()` persists the complete grant state in one DB write.

### Resulting write flow

Before (3 DB writes):

```
grant.save()         → INSERT grant (empty scopes)     [5-9ms]
...scope resolution...
grant.save()         → UPDATE grant (with scopes)       [4-5ms]
accessToken.save()   → INSERT access token              [4-5ms]
```

After (2 DB writes):

```
...scope resolution...
grant.save()         → INSERT grant (with scopes)       [4-5ms]
accessToken.save()   → INSERT access token              [4-5ms]
```

### Expected latency reduction

- Eliminates `grantSaveInitialMs` entirely (`5-9ms` saved).
- The final `grant.save()` becomes an INSERT (not UPDATE), which is slightly cheaper since there is no conflict resolution overhead.
- Write-path total: from `13-19ms` → `8-10ms`.

## 5. Correctness analysis

### Grant-AccessToken linkage

`AccessToken.grantId` is set to the pre-generated `nanoid()` value. `Grant.jti` is set to the same value. The adapter persists both with the same ID. Revoke-by-grant-id queries `payload->>'grantId'` on AccessToken records, which matches.

### Revocation behavior

`revokeByGrantId` in the adapter queries:

```sql
DELETE FROM oidc_model_instances
WHERE tenant_id = $1 AND model_name = $2 AND payload->>'grantId' = $3
```

This query depends on the AccessToken's payload containing `grantId`, which is unchanged. The grant record itself is deleted by a separate `destroy(grantId)` call. Both work identically with a pre-generated ID.

### ID uniqueness

`nanoid()` (default 21 characters, 126 bits of entropy) provides sufficient uniqueness. The `oidc_model_instances.id` column is `varchar(128)`. The unique constraint `(tenant_id, model_name, id)` provides additional isolation.

### Multi-tenant safety

The `tenantId` is part of the unique constraint and cache key. Pre-generating the ID does not affect tenant isolation.

## 6. Verification

### Existing integration tests

The token exchange integration tests already cover:

- Token exchange with resource
- Token exchange with organization
- Token exchange with actor token
- Revocation by grant ID

These tests will validate that the single-save change preserves correctness without any test modifications.

### Timing verification

The existing `measure()` wrappers and timing logs will show:

- `grantSaveInitialMs` disappears from timing output
- `grantSaveFinalMs` remains (renamed to `grantSaveMs` for clarity)
- Total write-path reduction is observable in `token_exchange_total_ms`
