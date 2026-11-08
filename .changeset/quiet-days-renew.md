---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/phrases": minor
---

add a refresh token lifetime setting for dynamic apps

Dynamic app (client ID metadata document) clients previously always used the default 14-day refresh token lifetime, so users had to sign in again every 14 days. Set "Refresh token time to live (TTL) in days" in the dynamic app settings, from 1 to 180 days, to apply one lifetime to all dynamic app clients. Changes apply to the next token issued.

The lifetime is now fixed from the first issuance for every dynamic app client: rotating a refresh token keeps its original expiration. Previously, dynamic app clients declaring `application_type: native` or a token endpoint authentication method other than `none` got a fresh lifetime on every refresh, up to 180 days; their users now sign in again once the configured lifetime ends.
