---
"@logto/schemas": minor
"@logto/core": minor
---

add support for new password digest algorithm argon2d and argon2id

In `POST /users`, the `passwordAlgorithm` field now accepts `Argon2d` and `Argon2id`.

Users with those algorithms will be migrated to `Argon2i` upon succussful sign in.
