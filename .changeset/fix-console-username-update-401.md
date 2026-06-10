---
"@logto/console": patch
---

fix Console username update returning 401 by redirecting to Account Center

The Account API requires identity verification for username changes, which the
Console profile page does not implement. Redirect username editing to the
Account Center's `/username` page (same pattern as MFA) where the full
verification flow is already implemented.
