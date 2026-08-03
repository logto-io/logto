---
"@logto/core": patch
---

fix a 500 error when assigning an empty list of scopes or roles

Management API endpoints that assign relations, such as `POST /applications/:applicationId/user-consent-scopes` and `POST /organizations/:id/users/:userId/roles`, now accept an empty array and make no changes, instead of responding with a 500 error.
