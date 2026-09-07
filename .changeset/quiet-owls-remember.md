---
"@logto/core": minor
---

honor `ForceAuthn` in SAML application authentication requests

When Logto acts as a SAML identity provider, it used to redirect every SAML sign-in to its own sign-in page with `prompt=login`, so a user who already had a Logto session was asked to sign in again for each SAML application, unlike OIDC applications, which reuse the session.

The SAML authentication endpoints now force re-authentication only when the service provider's `AuthnRequest` carries `ForceAuthn="true"` (SAML 2.0 core, section 3.4.1). Otherwise an existing Logto session is reused and the user is signed in without seeing the sign-in page again.
