---
"@logto/core": minor
"@logto/schemas": minor
---

honor `ForceAuthn` in SAML application authentication requests

When Logto acts as a SAML identity provider, it used to redirect every SAML sign-in to its own sign-in page with `prompt=login`, so a user who already had a Logto session was asked to sign in again for each SAML application, unlike OIDC applications, which reuse the session.

The SAML authentication endpoints now force re-authentication when required by the application policy or when the service provider's `AuthnRequest` carries `ForceAuthn="true"` (SAML 2.0 core, section 3.4.1). Otherwise an existing Logto session is reused and the user is signed in without seeing the sign-in page again.

SAML assertions report the actual authentication time when reusing an existing session.

To require fresh authentication independently of the service provider, set `authnRequestConfig.forceAuthn` to `true` using the SAML application Management API. The default is `false`.

To require signed authentication requests, set `authnRequestConfig.requireSignedAuthnRequests` to `true` and provide the service provider’s PEM-encoded RSA X.509 certificate in `authnRequestConfig.signingCertificate`. Both HTTP-POST and HTTP-Redirect signatures are verified. Unsigned requests remain accepted by default.
