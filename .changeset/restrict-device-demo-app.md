---
"@logto/core": patch
---

restrict the built-in device-demo-app client to non-admin tenants and basic OIDC scopes

The built-in `device-demo-app` client is no longer available on the admin tenant, and the OSS admin tenant no longer resolves the built-in `demo-app` client. On user tenants, `device-demo-app` is restricted to basic OIDC scopes (`openid`, `offline_access`, `profile`, `email`), cannot request API resources or inherit the tenant default resource, and always prompts for explicit user consent instead of auto-consenting or reusing prior session grants.
