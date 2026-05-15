---
"@logto/core": patch
---

fix over-counting of `usersPerOrganizationLimit` on `POST` and `PUT /organizations/:id/users`

The quota check previously consumed against the raw request body length, so:

- `POST { userIds: [u1, u1, u1] }` consumed three quota slots even though the insert (with `ON CONFLICT DO NOTHING`) only added a single member row.
- `POST { userIds: [u_existing] }` against an organization already at its quota cap returned `403`, even though no new row would have been inserted.
- `PUT { userIds: [u1, u1, ...] }` over-counted the delta by the number of duplicates and could fail with a primary-key collision inside `replace()`.

After this fix, both handlers dedup the request body, and the `POST` handler additionally filters against current members so quota is only consumed for the truly-new additions. No change to the SDK or Management API response shape.
