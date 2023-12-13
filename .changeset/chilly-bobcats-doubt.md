---
"@logto/core": patch
---

Revise the ` insert`` method within the  `RelationQueries`` class to utilize on conflict do nothing.

- For all the relation table entities, we want to safely insert them into the database. If the relation entity already exists, instead of throwing an error, we ignore the insert operation, especially on a batch insert. Unlike other resource data entities, user does not care if the relation entity already exists. Therefore, we want to silently ignore the insert operation if the relation entity already exists.
