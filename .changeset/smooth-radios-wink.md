---
"@logto/console": patch
---

fix display logic for "Always issue refresh token" and "Refresh token TTL" according to OIDC configuration

- Public clients (authentication method is none) are not allowed to disable refresh token rotation;
- Web public applications (i.e. SPA) with refresh token rotation enabled are not allowed to set refresh token TTL.
