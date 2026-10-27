---
"@logto/core": patch
---

block MFA factor enrollment and related prompts on sign-ins that skipped MFA verification

A sign-in that skips MFA verification, for example when Adaptive MFA does not trigger or a trusted device satisfies the policy, no longer shows the additional MFA, passkey or backup-code prompts or allows enrolling a new factor. Registration, pure step-up, and accounts with no stored factor and no primary email or phone that the configured email or phone MFA could use keep their existing behavior. A passkey or SSO verification is only accepted for the account it identified.
