---
"@logto/console": patch
---

make OSS onboarding email optional and show newsletter signup only for valid addresses

This keeps OSS onboarding completion independent from survey reporting.

- let users continue onboarding without providing an email address
- only show the newsletter checkbox after the email address passes validation
- skip OSS survey reporting when no valid email address is available
