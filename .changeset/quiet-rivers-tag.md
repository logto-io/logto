---
"@logto/schemas": patch
"@logto/core": patch
---

expose `isCurrent` on the Account API sessions response

`GET /api/my-account/sessions` now returns `isCurrent: boolean` on every entry. The session whose OIDC uid backs the calling access token is `true`; the others are `false`. Use this to mark the "This device" entry in session-management UIs and to avoid revoking the caller's own session.

The admin user-sessions endpoints (`GET /users/:userId/sessions` and `GET /users/:userId/sessions/:sessionId`) are unchanged — they have no caller-session concept and continue to use the original response shape.

Closes [#8681](https://github.com/logto-io/logto/issues/8681).
