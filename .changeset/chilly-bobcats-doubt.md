---
"@logto/core": patch
---

Set `on conflict do nothing` for all the `RelationQueries` insert operation.

- For all the relation table entities, we want to safely insert them into the database. If the relation entity already exists, instead of throwing an error, we ignore the insert operation, especially on a batch insert. Unlike other resource data entities, user does not care if the relation entity already exists. Therefore, we want to silently ignore the insert operation if the relation entity already exists.
