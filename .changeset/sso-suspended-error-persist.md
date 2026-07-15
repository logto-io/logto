---
"@logto/experience": patch
---

keep the suspended account error message visible on the sign-in form after enterprise SSO sign-in fails

Previously, when a suspended user completed the enterprise SSO flow, the error was only shown in a toast that auto-dismissed after a few seconds, leaving the sign-in form without any feedback. The error message now also persists on the sign-in form and is cleared when the user modifies the identifier input or submits the form again.
