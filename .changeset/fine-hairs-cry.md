---
"@logto/core": patch
---

fix users bypassing required MFA verification when tenant-wide MFA is optional

User-level and organization-level MFA requirements now take precedence over account settings that disable MFA or skip it at sign-in in optional mode. Previously, an existing email address could satisfy the MFA setup requirement when email MFA was enabled, while the account's settings allowed email-and-password sign-in without the required email verification step. Adaptive MFA continues to follow its risk-based verification decision.
