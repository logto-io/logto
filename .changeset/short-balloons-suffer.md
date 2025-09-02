---
"@logto/console": minor
"@logto/core": minor
"@logto/experience": minor
"@logto/phrases": minor
"@logto/phrases-experience": minor
"@logto/schemas": minor
---

Add Email/Phone MFA via verification codes

Summary
- Add two new MFA factors: Email verification code and SMS (phone) verification code.
- Support binding these factors during registration or first sign-in when MFA is required.
- Support verifying these factors on subsequent sign-ins with dedicated MFA verification pages.
- Update Console to configure these factors and surface guidance/conflict warnings.

Details
- New factors in schemas: `EmailVerificationCode`, `PhoneVerificationCode` under `MfaFactor`.
- Experience APIs for MFA code:
  - POST `/api/experience/verification/mfa-verification-code` → send code (body: `{ identifierType: "email" | "phone" }`) returns `{ verificationId }`.
  - POST `/api/experience/verification/mfa-verification-code/verify` → verify code (body: `{ verificationId, code, identifierType }`) returns `{ verificationId }`.
- Binding flows (experience UI):
  - When MFA policy prompts/mandates and the user has no email/phone MFA bound, user is taken to `mfa-binding/EmailVerificationCode` or `mfa-binding/PhoneVerificationCode` to input destination and complete verification.
- Verification flows (experience UI):
  - On subsequent sign-ins with email/phone MFA enabled, user is taken to `mfa-verification/EmailVerificationCode` or `mfa-verification/PhoneVerificationCode` to enter the 6-digit code. Resend supported via the API above.
- Admin & Console:
  - Console MFA settings list the two new factors with explanations and tips when they overlap with sign-in methods.
  - Admin user MFA endpoints (list/create/delete) work with existing TOTP/Backup Code and are unaffected; this feature adds experience-layer routes for sending/verifying MFA codes.

Validation and conflicts (Sign-in Experience)
- Email/Phone verification code cannot be used both as a primary sign-in method and an MFA factor at the same time.
- Allowed: enabling email/phone verification code as MFA when the corresponding identifier is used with password for sign-in.
- Rejected with validation errors when conflicting, including:
  - `sign_in_experiences.email_verification_code_cannot_be_used_for_mfa`
  - `sign_in_experiences.phone_verification_code_cannot_be_used_for_mfa`
  - `sign_in_experiences.email_verification_code_cannot_be_used_for_sign_in`
  - `sign_in_experiences.phone_verification_code_cannot_be_used_for_sign_in`

Requirements
- Configure a working Email connector to use Email verification code as MFA.
- Configure a working SMS connector to use Phone verification code as MFA.

Example configuration (excerpt)
```json
{
  "mfa": {
    "policy": "Mandatory",
    "factors": [
      "EmailVerificationCode",
      "PhoneVerificationCode",
      "Totp"
    ]
  },
  "signIn": {
    "methods": [
      { "identifier": "email", "password": true, "verificationCode": false, "isPasswordPrimary": true }
    ]
  }
}
```

i18n
- Add phrases for email/phone MFA screens: titles, descriptions, entry prompts, resend messages, and validation errors.

Notes
- This is a backward-compatible addition; bumps packages as minor.
- If you previously used email/phone verification code for passwordless sign-in, adjust your Sign-in Experience before enabling the corresponding MFA factor.

Forgot password methods customization (related)
- Introduce configurable forgot password channels via `forgotPasswordMethods` in Sign-in Experience.
- Supported values (see `ForgotPasswordMethod`): `EmailVerificationCode`, `PhoneVerificationCode`.
- Console adds a section to manage these methods, validates connector availability, and can auto-suggest defaults for new setups.
- Interoperability with MFA:
  - Forgot password choices are independent from MFA factors; enabling email/phone MFA does not disable the same channel for password reset.
  - Sign-in vs MFA conflict validation remains enforced only for sign-in methods, not for forgot password.

Example (forgot password excerpt)
```json
{
  "forgotPasswordMethods": [
    "EmailVerificationCode",
    "PhoneVerificationCode"
  ]
}
```
