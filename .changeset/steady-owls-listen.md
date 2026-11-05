---
"@logto/core": patch
---

check the audience of SAML enterprise SSO assertions against the connector's SP entity ID

A SAML enterprise SSO connector now accepts an assertion only when one of the assertion's `Audience` values exactly matches the connector's Audience URI (SP Entity ID) on the domain that receives the response or on the tenant's default domain. If SAML sign-in fails with "SAML assertion audience does not match the SP entity ID" after upgrading, set the audience at your identity provider to the Audience URI (SP Entity ID) shown in the connector's settings.
