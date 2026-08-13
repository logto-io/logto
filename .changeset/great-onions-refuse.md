---
'@logto/core': patch
---

fix revoking a user's third-party app authorization also signing the user out of that browser session

Revoking now only invalidates the revoked app's tokens and requires it to go through consent again on the next sign-in. The browser's single sign-on session stays intact.
