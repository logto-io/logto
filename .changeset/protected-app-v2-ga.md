---
"@logto/console": minor
"@logto/core": minor
---

add protected app ID token claim scopes and tenant custom domain SDK endpoint support

Protected App settings in Console let you choose which ID token claims (such as `roles`, `custom_data`, and `organizations`) are forwarded to your origin via the `Logto-ID-Token` header. When a tenant custom domain is active, Protected App remote config uses that domain as the SDK endpoint.
