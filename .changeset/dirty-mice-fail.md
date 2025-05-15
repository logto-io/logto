---
"@logto/core": minor
---

refactor: make the `userinfo_endpoint` field optional in the OIDC connector configuration to support providers like Azure AD B2C that do not expose a userinfo endpoint

Azure AD B2C SSO applications do not provide a userinfo_endpoint in their OIDC metadata. This has been a blocker for users attempting to integrate Azure AD B2C SSO with Logto, as our current implementation strictly follows the OIDC spec and relies on the userinfo endpoint to retrieve user claims after authentication.

- Updated the OIDC config response schema to make the userinfo_endpoint optional for OIDC based SSO providers.
- If the `userinfo_endpoint` is missing from the provider's OIDC metadata, the system will now extract user data directly from the `id_token` claims.
- If the `userinfo_endpoint` is present, the system will continue to retrieve user claims by calling the endpoint (existing behavior).

`userinfo_endpoint` is a standard OIDC field that specifies the endpoint for retrieving user information. For most of the OIDC providers, this update will not affect this existing implementation. However, for Azure AD B2C, this change allows users to successfully authenticate and retrieve user claims without the need for a userinfo endpoint.
