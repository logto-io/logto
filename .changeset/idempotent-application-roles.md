---
"@logto/core": minor
---

Make `POST /api/applications/:applicationId/roles` idempotent: role IDs already attached to the application are silently ignored instead of causing the request to fail with `422 application.role_exists`. The response is now `201` with body `{ roleIds, addedRoleIds }`, matching the response shape of `POST /api/users/:userId/roles`.

Closes #8900.
