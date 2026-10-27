---
"@logto/core": patch
"@logto/schemas": patch
---

add `hasPassword` to the members of an organization (`GET /api/organizations/:id/users`)

Whether a user has a password set was only readable one user at a time (`GET /api/users/:id/has-password`), so listing the members of an organization with how they sign in (password, social, both) cost one extra request per member. The organization members response now carries `hasPassword`, like the user profile response does.
