---
'@logto/core': patch
---

enforce the email allowlist before delivering a sign-in verification code that will register the address

When an identifier-first sign-in sends a code to an email no user owns while registration is enabled, the interaction can only become a registration after the code is verified. The email allowlist is now checked at send time in that case, so disallowed addresses are rejected with the usual `email_not_allowed` error before any email is delivered instead of after the code has been verified.
