---
"@logto/core": patch
---

send `Cross-Origin-Opener-Policy: same-origin-allow-popups` for the Admin Console

The Admin Console and the welcome page no longer keep an opener relationship with cross-origin windows that open them. Links and popups the console opens itself keep working, and the sign-in experience keeps its current policy, so popup-based sign-in flows are unaffected.
