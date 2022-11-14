---
"@logto/core": minor
---

Add user suspend API endpoint

Use `PATCH /api/users/:userId/is-suspended` to update a user's suspended state, once a user is suspended, all refresh tokens belong to this user will be revoked.

Suspended users will get an error toast when trying to sign in.
