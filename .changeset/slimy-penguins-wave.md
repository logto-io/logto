---
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

add config `alwaysIssueRefreshToken` for web apps to unblock OAuth integrations that are not strictly conform OpenID Connect.

when it's enabled, Refresh Tokens will be always issued regardless if `prompt=consent` was present in the authorization request.
