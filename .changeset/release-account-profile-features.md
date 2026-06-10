---
"@logto/core": minor
"@logto/console": minor
"@logto/account": minor
---

release account center profile page, custom profile fields at sign-up, and experience/account avatar upload from dev feature gates

The collect-user-profile sign-up flow now respects the explicit `signUpProfileFields` list instead of always showing the full catalog. The account center profile page and avatar upload endpoints are no longer gated behind a dev feature flag.
