---
"@logto/core": patch
---

emit one `AttributeValue` per item for multi-valued SAML attributes

A mapped claim that holds an array, such as `roles` or `organizations`, was written into the SAML assertion as one JSON-encoded string (`["Development","Employees"]`). Service providers expect one `saml:AttributeValue` element per value, as the SAML core specification describes, so role-based rules on the SP side could not match. Each item is now emitted as its own `AttributeValue`.

Object items, such as those of `organization_data` and `sso_identities`, stay JSON-encoded, one per `AttributeValue`.

This changes the assertion shape for existing integrations. A service provider that parses the JSON-encoded string of an array claim now receives one `AttributeValue` per item and should read them as a list, and an empty array yields the attribute without a value instead of `[]`.
