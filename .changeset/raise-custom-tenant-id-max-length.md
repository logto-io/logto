---
"@logto/core-kit": patch
---

raise the maximum custom tenant ID length from 19 to 36 characters

A canonical lowercase UUID now fits as a custom tenant ID. Derived admin tenant IDs such as `m-<tenantId>` and `t-<tenantId>` reach 38 characters, within the 64-character ID columns.
