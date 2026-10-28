---
"@logto/core": patch
---

stop validating a social connector form post callback after 100 invalid fields

`POST /callback/:connectorId` and `POST /account/callback/social/:connectorId` now reject an invalid body after checking at most 100 invalid fields, instead of checking every field first. The error response is unchanged.
