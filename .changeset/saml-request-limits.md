---
"@logto/core": patch
---

limit the size of SAML authentication requests sent to SAML applications

`GET` and `POST /api/saml/:id/authn` now reject a `SAMLRequest` whose decoded XML is larger than 16 KiB, has more than 128 elements or 256 attributes, or has an attribute without a value, with a 400 `application.saml.invalid_saml_request` error.
