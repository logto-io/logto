---
"@logto/connector-wecom": minor
---

add a `disableEmailSync` switch to the WeCom connector

The connector always synced the `email` field returned by WeCom to the user profile. This switch makes that configurable, matching the control the Microsoft Azure AD and standard OAuth2 connectors already offer. It is off by default, so existing connectors keep their current behavior.
