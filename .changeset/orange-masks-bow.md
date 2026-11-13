---
"@logto/connector-smtp": patch
---

validate SMTP connector config before creating the transport

The connector now gives nodemailer only the options its config declares, so any other keys in a stored or tested config are ignored when sending, as is `path` under `tls`. Configs that use declared options keep working, including implicit TLS on port 465 when `secure` is not set. The config also declares `dkim` with `domainName`, `keySelector` and `privateKey`: other keys under `dkim` are ignored, and a `dkim` object missing any of the three fails validation.
