---
"@logto/schemas": minor
"@logto/core": minor
---

added an `updated_at` field to the `user_sso_identities` table to track the last update time for each record.

On each successfull SSO sign-in, the `updated_at` field will be set to the current timestamp. This allows for better tracking of when a user's SSO identity was authenticated and updated.
