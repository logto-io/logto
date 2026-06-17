---
"@logto/core": patch
"@logto/schemas": patch
"@logto/experience": patch
"@logto/account": patch
---

prevent theme flash in sign-in experience and account center

Sign-in experience and account center now apply tenant theme, platform, and brand color before the app hydrates, reducing flashes of the wrong theme during initial page load.
