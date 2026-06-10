---
"@logto/core": minor
"@logto/schemas": minor
"@logto/shared": patch
---

add per-tenant username policy enforcement and mirror preferred_username from username by default

The sign-in experience now stores a per-tenant username policy (case sensitivity, length bounds, and allowed character types) that is enforced on end-user username writes: experience sign-up and profile fulfillment, the account API, and `/me`. Admin (Management API) writes keep the always-on baseline rules only.

Switching usernames to case-insensitive is guarded: `PATCH /api/sign-in-exp` is rejected with a 409 while usernames that differ only by case exist, and the new `GET /api/sign-in-exp/username-policy/case-sensitivity-conflicts` endpoint reports such conflicts.

For deployments using the legacy `CASE_SENSITIVE_USERNAME` environment variable: the effective case sensitivity is the per-tenant policy AND-combined with the env var, so usernames are treated case-insensitively if either is false. Existing `CASE_SENSITIVE_USERNAME=false` setups keep their behavior — the env var acts as a runtime override that forces case-insensitive handling for every tenant, and the per-tenant policy cannot re-enable case sensitivity while it is set. The env var is deprecated and slated for removal in the next major; migrate by unsetting it and configuring `usernamePolicy.caseSensitive` per tenant instead.

The OIDC `preferred_username` claim now falls back to the user's `username` when `profile.preferredUsername` is unset, so standards-compliant clients receive a usable value out of the box.
