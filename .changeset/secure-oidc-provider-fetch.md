---
"@logto/core": patch
"@logto/shared": patch
---

enable SSRF protection for OIDC provider outbound requests by default in self-hosted deployments

## Security enhancement

Self-hosted OSS deployments now use the OIDC provider's built-in SSRF safeguards for outgoing requests such as client `jwks_uri`, `sector_identifier_uri`, and back-channel logout endpoints. These safeguards protect requests from destinations that resolve to loopback, private, and other special-use network addresses.

## Action required for self-hosted OSS

No action is required unless your Logto instance must reach trusted relying-party endpoints on a private network. In that case, set `OIDC_PROVIDER_SSRF_PROTECTION_ENABLED=false` before starting the new or upgraded deployment to retain the previous behavior.

Disabling this protection permits OIDC provider outbound requests to private networks and should only be used when those endpoints are trusted. New deployments should leave the variable unset unless private-network access is required. Logto Cloud always keeps SSRF protection enabled.
