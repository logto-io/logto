---
"@logto/core": minor
"@logto/phrases": patch
"@logto/schemas": patch
---

support Google One Tap

- core: `GET /api/.well-known/sign-in-exp` now returns `googleOneTap` field with the configuration when available
- core: add Google Sign-In (GSI) url to the security headers
- core: verify Google One Tap CSRF token in `verifySocialIdentity()`
- phrases: add Google One Tap phrases
- schemas: migrate sign-in experience types from core to schemas
