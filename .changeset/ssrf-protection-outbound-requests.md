---
"@logto/core": patch
"@logto/shared": patch
---

extend SSRF protection to webhook delivery and enterprise SSO connector requests

Outbound requests to URLs supplied through the Management API are now blocked when they resolve to a special-use address such as loopback, a private range, or the cloud metadata endpoint (`169.254.169.254`). Previously a tenant admin could point a webhook URL or an enterprise SSO connector at an internal address and read the response back from the API error, letting them reach services on the deployment's own network.

The check covers webhook delivery (including `POST /api/hooks/:id/test`), OIDC SSO connector discovery, token and userinfo requests, and SAML IdP metadata fetching. It runs when the connection is established, so a hostname that resolves to an internal address is rejected just like a literal IP, and every redirect hop is checked again.

## Action required

Protection is enabled by default. If your deployment intentionally delivers webhooks or reaches SSO endpoints on a private network, list those destinations in `SSRF_ALLOWED_ADDRESSES` before starting Logto, as a comma-separated set of IP addresses or CIDR ranges:

```
SSRF_ALLOWED_ADDRESSES=10.0.0.0/8,127.0.0.1
```

Allowlisting the destinations is preferable to turning the protection off: every other special-use address, including the cloud metadata endpoint, stays blocked. Since CIMD accepts target URLs from unauthenticated callers, configuring an allowlist disables CIMD to prevent those callers from reaching private destinations. `SSRF_PROTECTION_DISABLED=true` also disables CIMD by turning the protection off entirely.

Both variables are only honored in self-hosted deployments. `OIDC_PROVIDER_SSRF_PROTECTION_DISABLED`, which previously covered only the OIDC provider's own requests, keeps working as an alias for `SSRF_PROTECTION_DISABLED`.
