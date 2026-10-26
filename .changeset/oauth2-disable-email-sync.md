---
"@logto/connector-oauth": minor
---

add a `disableEmailSync` switch to the standard OAuth2 connector

The connector always synced whatever the user info endpoint mapped to `email` to the user profile. This switch makes that configurable, matching the control the Microsoft Azure AD connector already offers. It is off by default, so existing connectors keep their current behavior.

The standard OAuth2 protocol carries no verification state for an email address, so the mapped value is taken at face value. Turn this on if you do not want the provider to supply the email address; the value stays available in `rawData`.
