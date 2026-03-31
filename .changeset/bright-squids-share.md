---
"@logto/core": minor
"@logto/schemas": minor
---

support sentinel protection for MFA verification routes

TOTP, WebAuthn, and backup code MFA verifications now report activity to Sentinel so repeated failures can be detected and blocked consistently during multi-factor authentication.

The new MFA-specific Sentinel actions keep MFA attempts isolated from the shared primary sign-in pool, which avoids lockouts leaking across unrelated verification stages or factors.
