---
"@logto/core": patch
---

block MFA factor enrollment and related prompts on sign-ins that skipped MFA verification

A sign-in that skips MFA verification, for example when Adaptive MFA does not trigger or a trusted device satisfies the policy, no longer shows the additional MFA or backup-code prompts or allows enrolling a new factor. Passkey sign-ins and users without an MFA factor yet remain unaffected. A passkey or SSO verification is only accepted for the account it identified.
