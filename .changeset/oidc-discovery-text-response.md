---
"@logto/core": patch
---

fix OIDC enterprise connector discovery config fetching for providers with strict response negotiation

OIDC enterprise connectors can now fetch discovery configuration from providers that reject JSON-only response negotiation with `406 Not Acceptable`.
