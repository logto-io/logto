---
"@logto/core": patch
---

support OIDC enterprise connector discovery endpoints that reject JSON-only response negotiation

OIDC enterprise connectors can now fetch discovery configuration from providers that reject JSON-only response negotiation with `406 Not Acceptable`.
