---
"@logto/core": patch
---

prune a grant's consumed refresh tokens on rotation

Refresh token rotation kept every consumed token until it expired so a replay could be detected and the grant revoked. A client that refreshes constantly could accumulate enough rows on one grant for revoking it to hit the database statement timeout on `/oidc/token` and `/oidc/token/revocation`.

Each rotation now also deletes a bounded batch of the grant's consumed refresh tokens older than 7 days, detached from the token response. A consumed token replayed after that is still rejected with `invalid_grant`, but revoking the grant is no longer guaranteed: the reuse-detection window shrinks from the token's own lifetime to 7 days, and pruning is driven by rotations of the same grant, whoever performs them.
