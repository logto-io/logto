---
"@logto/core": patch
---

make organization role creation transactional when assigning initial scopes

When creating an organization role with initial organization scopes or resource scopes, Logto now saves the role and its scope assignments in a single transaction. If any provided scope ID is invalid, the whole request fails without leaving a partially created role.
