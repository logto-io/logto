---
"@logto/core": patch
"@logto/schemas": patch
"@logto/account": patch
---

prevent users who are required to use MFA from turning off MFA verification on sign-in

Users who are required to use MFA by an admin or by an organization that requires MFA are now always asked for MFA verification on sign-in, even if they previously turned off 2-step verification. The Account Center hides the 2-step verification toggle for these users, and `GET /api/my-account/mfa-settings` returns a new `required` field that indicates whether MFA verification on sign-in is required for the user.
