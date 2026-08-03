---
"@logto/core": minor
"@logto/console": minor
---

add optional signed SAML authentication requests for enterprise SSO connectors

Enterprise SSO SAML connectors can now sign the SAML authentication request (AuthnRequest) sent to the identity provider. Generate a service-provider signing key on the connector, download its certificate and register it at the identity provider, then enable "Sign authentication request". RSA-SHA256 (default) and RSA-SHA512 are supported, and staged keys allow graceful, zero-downtime certificate rotation. Identity-provider metadata advertising `WantAuthnRequestsSigned` no longer breaks SAML sign-in when signing is disabled.
