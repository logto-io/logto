---
"@logto/connector-linkedin": patch
---

sync the LinkedIn email address only when LinkedIn reports it as verified

The connector now reads `email_verified` from the LinkedIn user info and leaves an unverified address in `rawData` only.
