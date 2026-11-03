---
"@logto/core": patch
---

emit one `AttributeValue` per item for multi-valued SAML attributes

A mapped claim that holds an array, such as `roles` or `organizations`, was written into the SAML assertion as one JSON-encoded string (`["Development","Employees"]`). Service providers expect one `saml:AttributeValue` element per value, as the SAML core specification describes, so role-based rules on the SP side could not match. Each item is now emitted as its own `AttributeValue`.
