---
"@logto/core": patch
---

fix mandatory-MFA enrollment loop when a verification-code factor is also a sign-up identifier

When `PhoneVerificationCode` (or `EmailVerificationCode`) is enabled as an MFA factor and the same identifier is also required at sign-up, a new user gets stuck in an unrecoverable mandatory-MFA loop: the factor is offered in `availableFactors`, but binding it fails with `{phone,email}_exists_in_profile` because the identifier is already on the profile, so the mandatory-MFA gate is never satisfied.

The offer layer now filters out any verification-code factor whose identifier is already on the user's profile, keeping the offered set consistent with what can actually be bound. Both `user.missing_mfa` and `session.mfa.suggest_additional_mfa` derive their `availableFactors` from this filtered set.
