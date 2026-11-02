---
"@logto/core": patch
---

fix SAML assertion attributes sent as unfilled placeholders for some mapped attribute names

SAML applications sent the literal `{attr…}` placeholder instead of the user's value for some mapped attribute names, such as `o365role` or `tenant1id`. These attributes now carry the mapped value.
