# @logto/account

## 0.5.0

### Minor Changes

- 3d38ae2074: add account center session management

  Users can now configure and use the account center Sessions page to review active sessions and connected third-party applications.

- c1ff0c114: release account center profile page, custom profile fields at sign-up, and experience/account avatar upload from dev feature gates

  The collect-user-profile sign-up flow now respects the explicit `signUpProfileFields` list instead of always showing the full catalog. The account center profile page and avatar upload endpoints are no longer gated behind a dev feature flag.

- bcd517bacf: add independent Account Center passkey controls for passkey sign-in

  Admins can now configure passkey visibility separately from MFA in Account Center, and users can manage passkeys plus their passkey sign-in prompt preference when passkey sign-in is enabled.

- 67b99bba85: apply the tenant username policy in sign-in experience and account center username forms

  Usernames entered during sign-up, profile fulfillment, and account center editing are validated against the tenant username policy with localized inline errors. The dedicated username pages (continue flow and account center) state the policy requirements in their page description, and the sign-up identifier form surfaces the full requirements sentence when an entered username violates the policy.

### Patch Changes

- 72820ac41e: prevent theme flash in sign-in experience and account center

  Sign-in experience and account center now apply tenant theme, platform, and brand color before the app hydrates, reducing flashes of the wrong theme during initial page load.

## 0.4.1

### Patch Changes

- 32c40b1ad: clarify Account Center 2-step verification toggle label
- 2ae0a420f: fix social linking callback in Account Center to preserve connector id

  Render the callback through React Router so `useParams()` can correctly read the `connectorId` from the URL and avoid incorrectly showing "social sign-in method is not enabled"

- 7c30c2adb: fix: silently re-authenticate Account Center on user info error instead of forcing the login screen

  When `/api/my-account` returns an error (e.g. a stale access token after a user switch on the same browser), Account Center now redirects with `prompt=none` so the OIDC provider can re-authenticate via the existing session cookie. If no valid session is available the provider answers with `error=login_required` and Account Center falls back to the previous `prompt=login` behavior, preserving the stale-state cleanup invariant from #8313 / #8554 / #8590.

- be5fa483a2: redirect expired account center sessions without flashing the manual sign-in error

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
