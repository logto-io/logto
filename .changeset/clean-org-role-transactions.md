---
"@logto/core": patch
---

fix organization role creation rollback when scope assignment fails

When creating an organization role with initial organization scopes or resource scopes, invalid scope IDs no longer leave a partially created role.
