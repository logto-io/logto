---
"@logto/core": patch
---

use literal JSONB keys in OIDC adapter `findByUid` and `findByUserCode` queries to ensure expression indexes can be used under prepared generic plans
