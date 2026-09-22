---
"@logto/core": minor
"@logto/phrases": patch
---

support custom user ID when creating a user via the Management API

This capability is available in Logto Open Source only and is not supported in Logto Cloud.

`POST /api/users` now accepts an optional `id` (up to 128 characters of letters, numbers, and `_ - . @ : + = |`). This lets you preserve existing user IDs, such as `auth0|abc123` or UUIDs, when migrating users from another identity provider. If the ID is already taken, the request fails with `user.id_already_in_use`.
