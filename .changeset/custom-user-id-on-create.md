---
"@logto/core": minor
"@logto/phrases": patch
---

support custom user ID when creating a user via the Management API

`POST /api/users` now accepts an optional `id` (up to 12 characters of letters, numbers, underscores, and hyphens). This lets you preserve existing user IDs when migrating users from another identity provider. If the ID is already taken, the request fails with `user.id_already_in_use`.
