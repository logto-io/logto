---
"@logto/core": patch
---

Sign out user after deletion or suspension

When a user is deleted or suspended through Management API, they should be signed out immediately, including sessions and refresh tokens.
