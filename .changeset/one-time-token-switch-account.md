---
"@logto/core": patch
"@logto/experience": patch
---

fix signing in with a one-time token link while another account is signed in

Signing in with a one-time token link (magic link) while an account without an email, such as a username-only account, was signed in now offers to switch accounts instead of failing. The email of the signed-in account is now matched against the link case-insensitively.
