---
"@logto/console": minor
"@logto/core": minor
"@logto/core-kit": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

support wildcard patterns in redirect URIs

Added support for wildcard patterns (`*`) in redirect URIs to better support dynamic environments like preview deployments.

Rules (web only):
- Wildcards are allowed for http/https redirect URIs in the hostname and/or pathname.
- Wildcards are rejected in scheme, port, query, and hash.
- Hostname wildcard patterns must contain at least one dot to avoid overly broad patterns.
