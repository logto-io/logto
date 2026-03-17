---
"@logto/core": minor
---

add `includePasswordHash` query parameter to `GET /users` and `GET /users/:userId`

When set to `true`, the response will include `passwordDigest` and `passwordAlgorithm` fields. This is intended for migration use cases where the raw password hash is needed.
