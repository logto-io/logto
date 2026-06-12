---
"@logto/core": patch
---

reject null bytes in OIDC request bodies and strip them from audit logs so malformed input returns a clean 400 instead of a 500

A null byte (`U+0000`) in an `application/x-www-form-urlencoded` body sent to `/oidc/token` previously surfaced as a `500 Internal Server Error`. The actual cause was the audit log insert: PostgreSQL rejects null bytes in `jsonb` (error `22P05`), and because the insert runs in a `finally` block, that failure masked the original clean error. The OIDC body parser now rejects null bytes with a `400 invalid_request`, and audit log payloads are sanitized of null bytes before insert as defense in depth.

Closes #8990.
