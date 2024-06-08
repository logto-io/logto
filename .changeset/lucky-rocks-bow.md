---
"@logto/console": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/integration-tests": patch
"@logto/phrases": patch
---

support per-organization multi-factor authentication requirement

An organization can now require its member to have multi-factor authentication (MFA) configured. If an organization has this requirement and a member does not have MFA configured, the member will not be able to fetch the organization access token.
