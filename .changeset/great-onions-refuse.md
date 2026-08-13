---
'@logto/core': patch
---

fix revoking a user's third-party app authorization also signing the user out of that browser session

Revoking now only affects the app being revoked — its tokens are invalidated and it must go through consent again on the next sign-in — while the browser's single sign-on session stays intact.
