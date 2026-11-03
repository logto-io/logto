---
"@logto/core": patch
---

reject SAML authentication requests whose XML is not well-formed

`GET` and `POST /api/saml/:id/authn` now reject a SAML request whose XML is not well-formed, such as one with an unescaped `&` or a mismatched end tag, with a 400 `application.saml.invalid_saml_request` error. The audit log entry of such a request records the format error under `samlRequestError` (`category: "xml_format"`, the error code, line, column and message). A request that cannot be decoded or parsed also gets this 400 error instead of a 500 when the application does not require signed authentication requests.
