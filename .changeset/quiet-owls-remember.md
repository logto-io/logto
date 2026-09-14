---
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

add authentication policies for SAML applications

SAML applications force fresh authentication by default, as before. To let a SAML application reuse an existing Logto session, turn off "Always force authentication" in the application settings, or set `authnRequestConfig.forceAuthn` to `false` using the SAML application Management API. The service provider can still require fresh authentication for a single sign-in with `ForceAuthn="true"` (SAML 2.0 core, section 3.4.1).

SAML assertions report the actual authentication time.

To require signed authentication requests, set `authnRequestConfig.requireSignedAuthnRequests` to `true` and provide the service provider’s PEM-encoded RSA X.509 certificate in `authnRequestConfig.signingCertificate`. Both HTTP-POST and HTTP-Redirect signatures are verified. Unsigned requests remain accepted by default.
