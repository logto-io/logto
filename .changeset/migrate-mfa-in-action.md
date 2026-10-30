---
"@logto/core": minor
"@logto/schemas": minor
---

support migrating MFA factors in the post first-factor verification action

The action result now accepts an optional `mfaVerifications` field to carry over TOTP, backup codes, and WebAuthn factors when a user is migrated just in time. Migrated factors are challenged in the same sign-in when MFA is required, even if the user previously skipped MFA on sign-in, and a conflicting existing factor fails the sign-in instead of being replaced.
