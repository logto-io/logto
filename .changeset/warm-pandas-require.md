---
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": patch
"@logto/schemas": minor
---

allow admins to require individual users to set up MFA, preventing those users from skipping the setup flow

Set `mfa.required` to `true` through the Management API, or turn on "Require MFA setup" on the user details page in Console. The user must bind MFA on their next sign-in and cannot skip it, regardless of the organization-level MFA policy.
