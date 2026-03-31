---
"@logto/console": patch
"@logto/phrases": patch
---

default custom jwt error blocking to on for new scripts

New custom claims scripts now default to blocking token issuance when the script fails.
Existing scripts without a saved `blockIssuanceOnError` value still keep the legacy default off
until a value is explicitly saved.

This also localizes the error handling hint shown in the console UI.
