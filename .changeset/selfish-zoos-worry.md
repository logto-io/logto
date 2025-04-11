---
"@logto/connector-oidc": patch
---

support string-typed boolean claims

Add an optional `acceptStringTypedBooleanClaims` configuration to `OidcConnectorConfig`, with default value `false`.
For standard OIDC protocol, some claims such as `email_verified` and `phone_verified` are boolean-typed, but some providers may return them as string-typed. Enabling this option will convert string-typed boolean claims to boolean-typed, which provides better compatibility.
By enabling this configuration, the connector will accept string-typed boolean ID token claims, such as `email_verified` and `phone_verified`.
