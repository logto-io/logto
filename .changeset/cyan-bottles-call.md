---
"@logto/core": patch
---

use native OpenAPI OAuth 2 security schema

The built-in OpenAPI OAuth 2 security schema is now used instead of the custom HTTP header-based security schema. This change improves compatibility with OpenAPI tools and libraries that support OAuth 2.
