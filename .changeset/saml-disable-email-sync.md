---
"@logto/connector-saml": minor
---

add a `disableEmailSync` switch to the SAML connector

The connector always synced the attribute that `Profile Mapping` maps to `email` to the user profile. This switch makes that configurable, matching the control the Microsoft Azure AD and standard OAuth2 connectors already offer. It is off by default, so existing connectors keep their current behavior.
