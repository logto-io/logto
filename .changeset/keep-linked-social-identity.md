---
"@logto/core": patch
"@logto/phrases": patch
---

keep a user's linked social account when another account from the same provider matches their email or phone

Signing in with a different account from a social provider the user had already linked, matched by email or phone, used to replace the existing link and its stored provider tokens. The sign-in is now rejected with `user.social_provider_already_linked`, asking the user to sign in with the linked account or another method; for custom sign-in UIs, identification returns this 422 instead of 404 `user.identity_not_exist`. To switch to another account from the same provider, unlink the existing one first.
