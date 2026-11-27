---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/experience": minor
"@logto/account": minor
---

let users choose email and SMS 2-step verification instead of enrolling everyone with an email or phone

A new sign-in experience setting, `mfa.verificationCodeEnrollment`, decides who counts as enrolled in the email and SMS verification code MFA factors. `Implicit` keeps the current behavior: every user with a primary email or phone is enrolled. In `Explicit` mode, email or phone counts only for users who enrolled it, so enabling these factors no longer turns on MFA for every user, and new users see the full factor list when they set up 2-step verification. Existing tenants stay in `Implicit` mode until they switch in Console > Multi-factor auth; new tenants start in `Explicit` mode.

- Binding an email or phone as an MFA factor now stores an `EmailVerificationCode` or `PhoneVerificationCode` record in both modes. During sign-in onboarding, users can enroll the email or phone already on their account by verifying a code sent to it.
- Users can add and remove email and SMS MFA in Account Center through the Account API. Admins can add and remove these factors through the Management API, and view and remove them in the Console.
- The Account and Management API MFA verification lists and the custom JWT `user.mfaVerificationFactors` include the new types for users who have a record.
