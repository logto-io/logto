---
"@logto/console": minor
"@logto/core": minor
"@logto/experience": minor
"@logto/phrases": minor
"@logto/phrases-experience": minor
"@logto/schemas": minor
---

add email/phone MFA via verification codes

Summary
- Add two new MFA factors: Email verification code and SMS (phone) verification code.
- Support binding these factors during registration or first sign-in when MFA is required.
- Support verifying these factors on subsequent sign-ins with dedicated MFA verification pages.
- Update Console to configure these factors and surface guidance/conflict warnings.
- Support customizing forgot password methods in Sign-in Experience (related).

To learn more about this feature, please refer to the documentation: https://docs.logto.io/end-user-flows/mfa
