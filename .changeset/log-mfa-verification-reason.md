---
"@logto/core": patch
---

append `mfaVerificationReason` to sign-in audit logs

`Interaction.SignIn.Submit` audit logs now record `mfaVerificationReason` to indicate why MFA verification was or was not required during sign-in.
