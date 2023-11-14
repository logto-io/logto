---
"@logto/core": minor
"@logto/console": minor
"@logto/experience": minor
"@logto/phrases": minor
"@logto/phrases-experience": minor
"@logto/schemas": minor
---

feature: introduce multi-factor authentication

We're excited to announce that Logto now supports multi-factor authentication (MFA) for your sign-in experience. Navigate to the "Multi-factor auth" tab to configure how you want to secure your users' accounts.

In this release, we introduce the following MFA methods:

- Authenticator app OTP: users can add any authenticator app that supports the TOTP standard, such as Google Authenticator, Duo, etc.
- WebAuthn (Passkey): users can use the standard WebAuthn protocol to register a hardware security key, such as biometric keys, Yubikey, etc.
- Backup codes：users can generate a set of backup codes to use when they don't have access to other MFA methods.

For a smooth transition, we also support to configure the MFA policy to require MFA for sign-in experience, or to allow users to opt-in to MFA.
