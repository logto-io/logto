---
"@logto/core": minor
---

update the jsonb field update mode from `merge` to `replace` for the `PATCH /application/:id endpoint`

For all the jsonb typed fields in the application entity, the update mode is now `replace` instead of `merge`. This means that when you send a `PATCH` request to update an application, the jsonb fields will be replaced with the new values instead of merging them.

This change is to make the request behavior more strict aligned with the restful API principles for a `PATCH` request.
