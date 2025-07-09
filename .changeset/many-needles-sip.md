---
"@logto/core": minor
---

add skip mfa for sign in

Users can now set `skipMfaOnSignIn` value via Account API's endpoint `PUT /api/my-account/mfa-settings` to skip MFA verification when signing in.

By default, this value is set to `false`, meaning MFA verification is required when signing in if the user has available MFA methods, which is the same behavior as before.

When set to `true`, users can sign in without MFA verification, even if they have available MFA methods. This is useful for users who want to skip MFA verification when signing in, but still want to use MFA for other actions.
