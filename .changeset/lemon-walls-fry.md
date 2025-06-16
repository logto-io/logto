---
"@logto/core": patch
---

fix: make `access_token` optional for Azure OIDC SSO connector

Previously, the Azure OIDC connector strictly required an access token in the token response, which caused issues with Azure B2C applications that only return ID tokens.

This change makes the connector more flexible by:

- Making access token optional in token response
- Conditionally fetching user claims from userinfo endpoint only when:
  - Access token is present in the response
  - Userinfo endpoint is supported by the provider
- Falling back to ID token claims when access token is not available
