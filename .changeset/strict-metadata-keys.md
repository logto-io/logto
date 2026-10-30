---
"@logto/schemas": patch
"@logto/core": patch
---

reject unknown `customClientMetadata` keys on the application APIs

`POST /api/applications` and `PATCH /api/applications/:id` used to accept any key under `customClientMetadata` and silently drop the ones they did not know, so a typo such as `refreshTokenTtlInDay` was answered 200 while the setting was never applied. An unknown key is now rejected with a 400 `guard.invalid_input` error whose `data` lists the key. Existing applications are not affected.
