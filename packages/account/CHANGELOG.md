# @logto/account

## 0.4.0

### Minor Changes

- d4570beed5: add the account center security page

  End users can now manage their account security from the account center:

  - `@logto/account` ships the `/account/security` route with social account linking and unlinking, MFA 2-step verification, and account deletion.
  - `@logto/console` exposes the delete-account URL field on the sign-in experience account center settings, and surfaces the account center and social prebuilt UI entries.

## 0.3.0

### Minor Changes

- 67463a9ed6: add support for replacing authenticator app via a dedicated `/authenticator-app/replace` route in Account Center, with a new PUT endpoint in Account API for idempotent TOTP replacement.
- 343410f2b0: support `identifier` URL parameter on OOTB Account Center to pre-fill identifier input fields
- 4ab0497277: support overriding the out-of-the-box account center language with the ui_locales URL parameter.

### Patch Changes

- 6eb14455a0: improve Account Center password forms for better browser autofill and password manager support

## 0.2.0

### Minor Changes

- 32d1562699: add out-of-the-box account center app

  Summary

  - Release the Account Center single-page app as a built-in Logto application for end users.
  - Support profile updates for primary email, phone, username, and password with verification flows.
  - Provide MFA management for TOTP, backup codes (download/regenerate), and passkeys (WebAuthn), including rename and delete actions.
  - Gate sensitive operations behind password/email/phone verification and surface dedicated success screens.

  To learn more about this feature, please refer to the documentation: https://docs.logto.io/end-user-flows/account-settings/by-account-api
