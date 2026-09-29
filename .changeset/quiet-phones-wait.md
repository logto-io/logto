---
"@logto/experience": patch
---

only offer to link a social account to an existing identifier when that identifier can sign in with a verification code

When a required secondary identifier (such as a phone number) was already used by another account during social sign-up, the "link and continue" modal was shown even if verification code sign-in was disabled for that identifier. Linking then failed with `user.sign_in_method_not_enabled` and left the user stuck. The user is now asked to use another identifier instead.
