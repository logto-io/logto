---
"@logto/core": patch
"@logto/shared": patch
---

strengthen OIDC provider outbound request security with SSRF protection enabled by default

Self-hosted deployments that need to reach trusted relying-party endpoints on private networks must set `OIDC_PROVIDER_SSRF_PROTECTION_ENABLED=false` before starting Logto; otherwise, leave the variable unset.
