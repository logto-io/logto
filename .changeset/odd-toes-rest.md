---
"@logto/connector-oidc": minor
"@logto/integration-tests": minor
"@logto/console": minor
"@logto/phrases": minor
"@logto/core": minor
---

add trust-unverified-email support for OIDC social connector and OIDC-based enterprise SSO connectors

- Add `trustUnverifiedEmail` to the OIDC social connector config (default `false`) to allow syncing emails when `email_verified` is missing or false
- Apply the setting in core OIDC/Azure OIDC SSO connectors and expose it in the Admin Console with new tips and translations
