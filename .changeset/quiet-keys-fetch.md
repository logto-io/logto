---
"@logto/core": patch
---

limit the size of client JWKS and sector identifier responses fetched by the OIDC provider

A `jwks_uri` or `sector_identifier_uri` response larger than 64 KiB is now rejected.
