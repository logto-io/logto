---
"@logto/connector-azuread": minor
---

add a `disableEmailSync` switch to the Microsoft Azure AD connector

The connector always synced the `mail` attribute returned by Microsoft Graph to the user profile. This switch makes that configurable, matching the control the Azure OIDC SSO connector already offers. It is off by default, so existing connectors keep their current behavior.
