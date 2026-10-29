---
"@logto/core": minor
"@logto/schemas": minor
---

add `hasPassword` to the members of an organization (`GET /api/organizations/:id/users`)

Each organization member now includes whether they have a password set, matching the user list and user detail responses.
