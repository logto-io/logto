---
"@logto/schemas": minor
---

Add `type` field to `roles` schema.

`type` can be either 'User' or 'MachineToMachine' in our case, this change distinguish between the two types of roles.
Roles with type 'MachineToMachine' are not allowed to be assigned to users and 'User' roles can not be assigned to machine-to-machine apps.
It's worth noting that we do not differentiate by `scope` (or `permission` in Admin Console), so a scope can be assigned to both the 'User' role and the 'MachineToMachine' role simultaneously.
