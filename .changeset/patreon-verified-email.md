---
"@logto/connector-patreon": patch
---

sync the Patreon email address only when Patreon reports it as verified

The connector now reads `is_email_verified` from the Patreon user info and leaves an unverified address in `rawData` only.
