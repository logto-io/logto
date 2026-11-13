---
"@logto/core": patch
---

sign in a SAML SSO user only through the connector that linked their identity

An enterprise SSO identity linked through a SAML connector no longer signs in through a different connector that reports the same IdP entity ID. That sign-in now fails with `user.enterprise_sso_identity_not_exists`. OIDC connectors are unchanged. If two SAML connectors in a tenant use the same IdP entity ID, each user keeps signing in through the connector they were first linked through.
