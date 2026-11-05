---
"@logto/connector-facebook": minor
---

add a `disableEmailSync` switch to the Facebook connector

The connector always synced the `email` field returned by Facebook to the user profile. This switch makes that configurable, matching the control the Microsoft Azure AD and standard OAuth2 connectors already offer. It is off by default, so existing connectors keep their current behavior.
