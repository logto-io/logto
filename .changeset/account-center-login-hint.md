---
"@logto/account": minor
"@logto/phrases": patch
---

forward `login_hint` from Account Center URLs to the sign-in page

Add `login_hint=` to any Account Center URL (for example, `https://auth.foo.com/account/security?login_hint=foo@example.com`) to pre-fill the identifier on the sign-in page when the user needs to sign in. The hint only pre-fills the field, so users can still sign in with a different identifier.
