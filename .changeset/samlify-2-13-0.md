---
"@logto/core": patch
"@logto/connector-saml": patch
---

upgrade `samlify` to `^2.13.0`, which consistently XML-escapes attribute values in generated SAML assertions, and adapt the SAML application and SSO connector call sites to its stricter return types (`getAssertionConsumerService`, `getX509Certificate`, and the `createLoginResponse` binding-context union)
