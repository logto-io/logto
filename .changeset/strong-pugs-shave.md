---
"@logto/core": patch
---

reject account API reads that need recent authentication from third-party applications

Reading backup codes, sessions, grants, and trusted devices now requires a first-party application, matching the first-party only policy that the account mutations already enforce.
