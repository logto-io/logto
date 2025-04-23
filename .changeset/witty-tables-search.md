---
"@logto/console": minor
---

feat: introduced new `security` section to Logto console.

We have introduced a new security section in the Logto console, which includes the following features:

- Password policy: This feature has been migrated from the signInExperience section to the new security section.
- CAPTCHA: Enable CAPTCHA for sign-up, sign-in, and password recovery to mitigate automated threats.
- Identifier lockout: Temporarily lock an identifier after multiple failed authentication attempts (e.g., consecutive incorrect passwords or verification codes) to prevent brute force access.
