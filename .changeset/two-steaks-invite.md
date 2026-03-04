---
"@logto/core": minor
---

introduce session management endpoints for account and management APIs, with optional grants revocation and richer session context.

Account APIs:

- List active user sessions: `GET /my-account/sessions`.
- Revoke a user session by ID: `DELETE /my-account/sessions/:sessionId`.
  - Optional query param `revokeGrantsTarget`: `all` revokes grants for all apps; `firstParty` revokes only first-party app grants.
  - When grants are revoked, previously issued opaque access tokens and refresh tokens for those grants will be invalidated.
- Add a new account center permission setting `session` with `off`, `readOnly`, and `edit` to control access to the session management account APIs.
- These endpoints are also gated by the `urn:logto:scope:sessions` user scope (`UserScope.Sessions`). Only tokens with this scope granted can access these endpoints.

Management APIs:

- List active user sessions: `GET /users/:userId/sessions`.
- Get a single active user session: `GET /users/:userId/sessions/:sessionId`.
- Revoke a user session by ID: `DELETE /users/:userId/sessions/:sessionId`.
  - Optional query param `revokeGrantsTarget`: `all` revokes grants for all apps; `firstParty` revokes only first-party app grants.
  - When grants are revoked, previously issued opaque access tokens and refresh tokens for those grants will be invalidated.

Session context:

- Record user IP, user agent, and GEO location (when available from injected-headers) in interaction submission data so it can be returned in `session.lastSubmission`.
