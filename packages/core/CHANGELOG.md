# Change Log

## 1.35.0

### Minor Changes

- 116dcf5e7d: support reCaptcha domain customization

  You can now customize the domain for reCaptcha, for example, using reCaptcha with `recaptcha.net` domain.

- d551f5ccc3: support creating third-party SPA and Native applications

  Previously, only traditional web applications could be marked as third-party apps. Now you can also create third-party single-page applications (SPA) and native applications, enabling more flexible OAuth/OIDC integration scenarios.

- 7c87ebc068: add client IP address to passwordless connector message payload

  The `SendMessageData` type now includes an optional `ip` field that contains the client IP address of the user who triggered the message. This can be used by HTTP email/SMS connectors for rate limiting, fraud detection, or logging purposes.

- 116dcf5e7d: support reCAPTCHA Enterprise checkbox mode

  You can now choose between two verification modes for reCAPTCHA Enterprise:

  - **Invisible**: Score-based verification that runs automatically in the background (default)
  - **Checkbox**: Displays the "I'm not a robot" widget for user interaction

  Note: The verification mode must match your reCAPTCHA key type configured in Google Cloud Console.

### Patch Changes

- a6858e76cf: update SAML relay state length and improve error handling

  The data type of the `relay_state` column in the `saml_application_sessions` table has been changed from varchar(256) to varchar(512) to accommodate longer Relay State values. For example, when Firebase acts as a Service Provider and initiates a SAML request, the relay state length is approximately 300-400 characters, which previously prevented Firebase from integrating with Logto as an SP before this fix.

  Additionally, we have updated the error handling logic in the APIs related to the SAML authentication flow to make error messages more straightforward.

- 462e430445: update the `getI18nEmailTemplate` fallback logic to also attempt to retrieve the `generic` template with default locale, if both the locale-specific and fallback templates are unavailable
- Updated dependencies [a6858e76cf]
- Updated dependencies [116dcf5e7d]
- Updated dependencies [e751e8d5ce]
- Updated dependencies [462e430445]
- Updated dependencies [d551f5ccc3]
- Updated dependencies [7c87ebc068]
- Updated dependencies [116dcf5e7d]
  - @logto/phrases@1.24.0
  - @logto/schemas@1.35.0
  - @logto/experience@1.18.0
  - @logto/console@1.32.0
  - @logto/connector-kit@4.7.0
  - @logto/demo-app@1.5.0
  - @logto/account@0.1.0
  - @logto/cli@1.35.0

## 1.34.0

### Minor Changes

- 08f887c448: support cross-app authentication callbacks within the same browser session

  When multiple applications are initiating authentication requests within the same browser session,
  authentication callbacks may interfere with each other due to the shared `_interaction` cookie.

  To resolve this, we now change the cookie from a plain UID string to a structured mapping object
  `{ [app_id]: interaction_uid }`, and maintain the `app_id` in either the URL search parameters or HTTP
  headers for all authentication-related requests and redirects. This ensures that each application can
  correctly identify its own authentication context without interference from others.

  The fallback mechanism is also implemented to ensure backward compatibility.

- c3266a917a: add a new webhook event "Identifier.Lockout", which is triggered when a user is locked out due to repeated failed sign-in attempts

### Patch Changes

- 900201a48c: align refresh token grant lifetime with 180-day TTL

  Refresh tokens were expiring after 14 days because the provider grant TTL was still capped at the default two weeks, regardless of the configured refresh token TTL.

  Now set the OIDC grant TTL to 180 days so refresh tokens can live for their configured duration, also expand the refresh token TTL up to 180 days.

- dadbea6936: fix email/phone template selection during sign up

  Previously, the send code API (Experience API) always switched to the `TemplateType.BindMfa` email template as soon as an interaction already had an identified user. During multi-step sign-up flows (for example, username + email), the interaction can already identify the user before the email step finishes, so legitimate sign-up verifications were mistakenly treated as MFA binding and used the wrong template.

  The fix checks if the email/phone identifier is part of the sign-up identifiers. If it is, then we are still in the sign-up flow and should use the appropriate sign-up email/phone template. Only when the email/phone is not part of the sign-up identifiers (meaning the sign-up flow is complete) and the interaction has an identified user, do we switch to the `BindMfa` template.

- c6554587ee: improve SSO connectors with case-insensitive domain matching

  According to the latest standards, email domains should be treated as case-insensitive. To ensure robust and user-friendly authentication, we need to locate SSO connectors correctly regardless of the letter case in the provided email domain.

  - Domain normalization on insert: The domains configured for SSO connectors are now normalized to lowercase before being inserted into the database. This ensures consistency and prevents issues arising from varied casing. As part of this change, identical domains with different casing will be treated as duplicates and rejected to maintain data integrity.
  - Case-insensitive search for SSO connectors: The get SSO connectors by email endpoint has been updated to perform a case-insensitive search when matching email domains. This guarantees that the correct enabled SSO connector is identified, regardless of the casing used in the user's email address.

- Updated dependencies [900201a48c]
- Updated dependencies [08f887c448]
- Updated dependencies [c3266a917a]
  - @logto/schemas@1.34.0
  - @logto/experience@1.17.0
  - @logto/console@1.31.0
  - @logto/phrases@1.23.0
  - @logto/account-center@0.1.0
  - @logto/cli@1.34.0
  - @logto/demo-app@1.5.0

## 1.33.0

### Minor Changes

- dff3918c8d: add API for MFA skip controls

  expose logto_config endpoints in account and management APIs for managing MFA skip controls

  - /api/my-account/logto-configs
  - /api/admin/users/:userId/logto-configs

- 4f5b4e33dc: append `applicationId` to the experience API audit logs

### Patch Changes

- f55e171956: fix a bug that the `locale` param used in email templates does not respect the user custom languages
- e5d3dd3278: remove deprecated interaction API endpoints from OpenAPI swagger documentation.

  The legacy interaction API endpoints are no longer supported and have been replaced by the Experience API endpoints.

- bb495efcae: add body-based personal access token APIs

  introduce PATCH/POST endpoints that accept token names in the request body to support special characters while keeping path-based routes for compatibility:

  - PATCH /api/users/{userId}/personal-access-tokens
  - POST /api/users/{userId}/personal-access-tokens/delete

- Updated dependencies [3ed4d0a91e]
- Updated dependencies [bb495efcae]
- Updated dependencies [568db900bb]
- Updated dependencies [7a32a89911]
- Updated dependencies [47dbdd8332]
  - @logto/experience@1.16.1
  - @logto/console@1.30.0
  - @logto/phrases@1.22.0
  - @logto/demo-app@1.5.0
  - @logto/schemas@1.33.0
  - @logto/cli@1.33.0

## 1.32.0

### Minor Changes

- ad4f9d6abf: add support to the OIDC standard authentication parameter `ui_locales`

  We are now supporting the standard OIDC `ui_locales` auth parameter to customize the language of the authentication pages. You can pass the `ui_locales` parameter in the `signIn` method via the `extraParams` option in all Logto SDKs.

  ### What it does

  - Determines the UI language of the Logto-hosted sign-in experience at runtime. Logto picks the first language tag in `ui_locales` that is supported in your tenant's language library.
  - Affects email localization for messages triggered by the interaction (e.g., verification code emails).
  - Exposes the original value to email templates as a variable `uiLocales`, allowing you to include it in the email subject/content if needed.

  ### Example

  If you want to display the sign-in page in French (Canada), you can do it like this:

  ```ts
  await logtoClient.signIn({
    redirectUri: "https://your.app/callback",
    extraParams: {
      ui_locales: "fr-CA fr en",
    },
  });
  ```

  Refer to the [documentation](https://docs.logto.io/end-user-flows/authentication-parameters/ui-locales) for more details.

- 1fb8593659: add email/phone MFA via verification codes

  Summary

  - Add two new MFA factors: Email verification code and SMS (phone) verification code.
  - Support binding these factors during registration or first sign-in when MFA is required.
  - Support verifying these factors on subsequent sign-ins with dedicated MFA verification pages.
  - Update Console to configure these factors and surface guidance/conflict warnings.
  - Support customizing forgot password methods in Sign-in Experience (related).

  To learn more about this feature, please refer to the documentation: https://docs.logto.io/end-user-flows/mfa

- 0ef4260e34: unify branding customization options between applications and organizations

  We are now offering a more unified experience for branding customization options between applications and organizations, including:

  - Branding colors (light and dark mode)
  - Branding logos and favicons (both light and dark mode)
  - Custom CSS

  When all branding customization options are set, the precedence of the options are as follows:
  Organization > Application > Omni sign-in experience settings

### Patch Changes

- 1e77967e7c: fix(core): bind WebAuthn `rpId` to request domain for account api

  - Before: WebAuthn registration via the account API always bound passkeys to the Logto default domain.
  - After: The `rpId` now matches the domain you use to access the API (including custom domains), consistent with the sign-in experience.

- Updated dependencies [ad4f9d6abf]
- Updated dependencies [5da6792d40]
- Updated dependencies [147f257503]
- Updated dependencies [1fb8593659]
- Updated dependencies [0ef4260e34]
  - @logto/experience@1.16.0
  - @logto/schemas@1.32.0
  - @logto/connector-kit@4.6.0
  - @logto/phrases-experience@1.12.0
  - @logto/console@1.29.0
  - @logto/phrases@1.21.0
  - @logto/cli@1.32.0
  - @logto/demo-app@1.5.0

## 1.31.0

### Minor Changes

- 316840062e: Add PBKDF2 support for legacy password verification

  Added support for PBKDF2 (Password-Based Key Derivation Function 2) algorithm in legacy password verification. This enhancement allows the system to properly verify passwords that were hashed using PBKDF2 methods, improving compatibility with existing password systems during migration.

  Example usage for user migration with PBKDF2-hashed passwords:

  ```json
  {
    "username": "john_doe",
    "primaryEmail": "john.doe@example.com",
    "passwordAlgorithm": "Legacy",
    "passwordDigest": "[\"pbkdf2\", [\"mySalt123\", \"1000\", \"20\", \"sha512\", \"@\"], \"c465f66c6ac481a7a17e9ed5b4e2e7e7288d892f12bf1c95c140901e9a70436e\"]"
  }
  ```

  Where the arguments are:

  - `salt`: user-defined salt value
  - `iterations`: number of iterations (e.g., 1000)
  - `keylen`: key length (e.g., 20)
  - `digest`: hash algorithm (e.g., 'sha512')
  - `@`: placeholder for the input password

- bb385eb15d: add a new feature for collecting user profile on new user registration

  You can now collect user profile information on the last step of your registration flow.

  ### Getting started

  1. In Console: `Sign-in Experience > Collect user profile`. Add your profile fields:

     - Use built-in basics (Name, Gender, Birthdate, Address, …); or
     - Create custom fields (choose type, label, validation rules, required, etc.).

  2. Drag & drop to reorder fields in the list; the order reflects in the form.
  3. Test by signing up a new user in the demo app; a "Tell us about yourself" step will appear with your fields.
  4. Registration completes only after all required fields are filled.

  Check out our [docs](https://docs.logto.io/end-user-flows/collect-user-profile) for more details.

### Patch Changes

- Updated dependencies [8ae82d585e]
- Updated dependencies [bb385eb15d]
  - @logto/phrases-experience@1.11.0
  - @logto/phrases@1.20.0
  - @logto/experience@1.15.0
  - @logto/console@1.28.0
  - @logto/schemas@1.31.0
  - @logto/demo-app@1.5.0
  - @logto/cli@1.31.0

## 1.30.1

### Patch Changes

- Updated dependencies [4cc321dbb]
  - @logto/core-kit@2.6.1
  - @logto/cli@1.30.1
  - @logto/console@1.27.0
  - @logto/demo-app@1.5.0
  - @logto/experience@1.14.0
  - @logto/phrases-experience@1.10.1
  - @logto/schemas@1.30.1

## 1.30.0

### Minor Changes

- 34964af46: feat: support custom scope in the social verification API

  This change allows developers to specify a custom `scope` parameter in the user account social verification API. If a scope is provided, it will be used to generate the authorization URI; otherwise, the default scope configured in the connector will be used.

  - Affected endpoints:
    - `POST /api/verifications/social`

- 289ab5119: add totp and backup code via account api

  Users can now add TOTP and backup code via Account API.

  The endpoints are:

  - `POST /api/my-account/mfa-verifications/totp-secret/generate`: Generate a TOTP secret.
  - `POST /api/my-account/mfa-verifications/backup-codes/generate`: Generate backup codes.
  - `POST /api/my-account/mfa-verifications`: Add a TOTP or backup code using the generated secret or codes.
  - `GET /api/my-account/mfa-verifications/backup-codes`: Retrieve backup codes.

- 0343699d7: feat: introduce Logto Secret Vault and federated token set storage

  This update introduces the new [Secret vault](https://docs.logto.io/secret-vault/) feature in Logto.

  The Secret Vault is designed to securely store sensitive user data — such as access tokens, API keys, passcodes, and other confidential information. These secrets are typically used to access third-party services on behalf of users, making secure storage essential.

  With this release, federated token set storage support is added to both social and enterprise SSO connectors. When enabled, Logto will securely store the token set issued by the provider after a successful user authentication. Applications can then retrieve the access token later to access third-party APIs without requiring the user to reauthenticate.

  Supported connectors include:

  - **Social connectors**: GitHub, Google, Facebook, Standard OAuth 2.0, and Standard OIDC.
  - **Enterprise SSO connectors**: All OIDC-based SSO connectors.

  1. Enable the token storage as needed for social and enterprise SSO connectors in the Logto Console or via the Logto Management API.
  2. Once enabled, Logto will automatically store the token set issued by the provider after a successful user authentication.
  3. After the token set is stored, you can retrieve the access token via the Logto Account API for the user. This allows your application to access third-party APIs without requiring the user to reauthenticate.

  For more details, please check the [Federated token set storage](https://docs.logto.io/secret-vault/federated-token-set) documentation.

  Note:
  For OSS users, to enable the Secret Vault feature, you must set the `SECRET_VAULT_KEK` environment variable to a valid base64 enabled secret key. This key is used to encrypt and decrypt the secrets stored in the vault. For more information, please refer to the [configuration variables](https://docs.logto.io/concepts/core-service/configuration#variables) documentation.

### Patch Changes

- Updated dependencies [9a4e11cf8]
- Updated dependencies [34964af46]
- Updated dependencies [34964af46]
- Updated dependencies [0343699d7]
- Updated dependencies [0343699d7]
- Updated dependencies [3f5533080]
  - @logto/schemas@1.30.0
  - @logto/connector-kit@4.4.0
  - @logto/console@1.27.0
  - @logto/cli@1.30.0
  - @logto/demo-app@1.5.0
  - @logto/experience@1.14.0

## 1.29.0

### Minor Changes

- f2c0a05ac: added an `updated_at` field to the `user_sso_identities` table to track the last update time for each record.

  On each successfull SSO sign-in, the `updated_at` field will be set to the current timestamp. This allows for better tracking of when a user's SSO identity was authenticated and updated.

- 50d50f73b: manage WebAuthn passkeys in Account API

  You can now manage WebAuthn passkeys in Account API, including:

  1. Bind a WebAuthn passkey to the user's account through your website.
  2. Manage the passkeys in the user's account.

  We implemented [Related Origin Requests](https://passkeys.dev/docs/advanced/related-origins/) so that you can manage the WebAuthn passkeys in your website which has a different domain from the Logto's sign-in page.

  To learn more, checkout the [documentation](https://docs.logto.io/end-user-flows/account-settings/by-account-api).

- db77aad7a: feat: add user interaction details to the custom token claims context

  This update introduces a key feature that allows the storage of user interaction details in the `oidc_session_extensions` table for future reference.

  Developers can now access user interaction data associated with the current token's authentication session through the context in the custom token claims script, enabling the creation of tailored token claims.

  Key Changes:

  - Store interaction details: User interaction details are now stored in the oidc_session_extensions table, providing a historical reference for the associated authentication session.
  - Access user interaction details: In the custom token claims script, developers can retrieve user interaction details through the `context.interaction` property, allowing for the creation of dynamic and context-aware token claims. Logto will use the `sessionUid` to query the `oidc_session_extensions` table and retrieve the user interaction details.
  - Interaction Context Includes:
    - `interactionEvent`: The event that triggered the interaction, such as `SignIn`, `Register`.
    - `userId`: The unique identifier of the user involved in the interaction.
    - `verificationRecords`: An array of verification records, providing details about the verification methods used for user identification and any MFA verification if enabled.

  Example Use Case:
  Developers can read the verification records from the interaction context. If an Enterprise SSO verification record is found, they can pass the user profile from the Enterprise SSO identities as additional token claims.

  ```ts
  const ssoVerification = verifications.find(
    (record) => record.type === "EnterpriseSso",
  );

  if (ssoVerification) {
    return {
      enterpriseSsoIdentityId:
        enterpriseSsoVerification?.enterpriseSsoUserInfo?.id,
      familyName: enterpriseSsoVerification?.enterpriseSsoUserInfo?.familyName,
    };
  }
  ```

### Patch Changes

- 269434e18: fix SAML application callback API `RelayState` parameter handling

  Previously, the `RelayState` parameter was not properly passed through in SAML authentication responses. Now when a SAML authentication response contains `RelayState`, it will be correctly included in the auto-submit form.

- 47b25473f: fix: make `access_token` optional for Azure OIDC SSO connector

  Previously, the Azure OIDC connector strictly required an access token in the token response, which caused issues with Azure B2C applications that only return ID tokens.

  This change makes the connector more flexible by:

  - Making access token optional in token response
  - Conditionally fetching user claims from userinfo endpoint only when:
    - Access token is present in the response
    - Userinfo endpoint is supported by the provider
  - Falling back to ID token claims when access token is not available

- 3cf7ee141: fix potential WebAuthn registration errors by specifying the displayName

  This is an optional field, but it's actually required by some browsers. For example, when using Chrome on Windows 11 with the "Use other devices" option (scanning QR code), an empty displayName will cause the registration to fail.

- Updated dependencies [f2c0a05ac]
- Updated dependencies [db77aad7a]
- Updated dependencies [db77aad7a]
- Updated dependencies [a9324332a]
- Updated dependencies [50d50f73b]
  - @logto/schemas@1.29.0
  - @logto/console@1.26.0
  - @logto/cli@1.29.0

## 1.28.0

### Minor Changes

- 35bbc4399: add phone number validation and parsing to ensure the correct format when updating an existing user’s primary phone number or creating a new user with a phone number
- 613305ec8: refactor: make the `userinfo_endpoint` field optional in the OIDC connector configuration to support providers like Azure AD B2C that do not expose a userinfo endpoint

  Azure AD B2C SSO applications do not provide a userinfo_endpoint in their OIDC metadata. This has been a blocker for users attempting to integrate Azure AD B2C SSO with Logto, as our current implementation strictly follows the OIDC spec and relies on the userinfo endpoint to retrieve user claims after authentication.

  - Updated the OIDC config response schema to make the userinfo_endpoint optional for OIDC based SSO providers.
  - If the `userinfo_endpoint` is missing from the provider's OIDC metadata, the system will now extract user data directly from the `id_token` claims.
  - If the `userinfo_endpoint` is present, the system will continue to retrieve user claims by calling the endpoint (existing behavior).

  `userinfo_endpoint` is a standard OIDC field that specifies the endpoint for retrieving user information. For most of the OIDC providers, this update will not affect this existing implementation. However, for Azure AD B2C, this change allows users to successfully authenticate and retrieve user claims without the need for a userinfo endpoint.

- e8df19b7e: feat: introduce email blocklist policy

  We have added a new `emailBlocklistPolicy` in the `signInExperience` settings. This policy allows you to customize the email restriction rules for all users. Once this policy is set, users will be restricted from signing up or linking their accounts with any email addresses that are against the specified blocklist.
  This feature is particularly useful for organizations that want to prevent users from signing up with personal email addresses or any other specific domains.

  Available settings include:

  - `customBlocklist`: A custom blocklist of email addresses or domains that you want to restrict.
  - `blockSubaddressing`: Restrict email subaddressing (e.g., 'user+tag@example.com').

- 494148355: refactor: enhanced user lookup by phone with phone number normalization

  In some countries, local phone numbers are often entered with a leading '0'. However, in the context of the international format this leading '0' should be stripped. E.g., +61 (0)2 1234 5678 should be normalized to +61 2 1234 5678.

  In the previous implementation, Logto did not normalize the user's phone number during the user sign-up process. Both 61021345678 and 61212345678 were considered as valid phone numbers, and we do not normalize them before storing them in the database. This could lead to confusion when users try to sign-in with their phone numbers, as they may not remember the exact format they used during sign-up. Users may also end up with different accounts for the same phone number, depending on how they entered it during sign-up.

  To address this issue, especially for legacy users, we have added a new enhenced user lookup by phone with either format (with or without leading '0') to the user sign-in process. This means that users can now sign-in with either format of their phone number, and Logto will try to match it with the one stored in the database, even if they might have different formats. This will help to reduce confusion and improve the user experience when logging in with phone numbers.

  For example:

  - If a user signs up with the phone number +61 2 1234 5678, they can now sign-in with either +61 2 1234 5678 or +61 02 1234 5678.
  - The same applies to the phone number +61 02 1234 5678, which can be used to sign-in with either +61 2 1234 5678 or +61 02 1234 5678.

  For users who might have created two different accounts with the same phone number but different formats. The lookup process will always return the one with an exact match. This means that if a user has two accounts with the same phone number but different formats, they will still be able to sign-in with either format, but they will only be able to access the account that matches the format they used during sign-up.

  For example:

  - If a user has two accounts with the phone numbers +61 2 1234 5678 and +61 02 1234 5678. They will need to sign-in to each account using the exact format they used during sign-up.

  related github issue [#7371](https://github.com/logto-io/logto/issues/7371).

### Patch Changes

- Updated dependencies [35bbc4399]
- Updated dependencies [80112708d]
- Updated dependencies [e8df19b7e]
- Updated dependencies [c1dfbfdd2]
  - @logto/experience@1.14.0
  - @logto/console@1.25.0
  - @logto/shared@3.3.0
  - @logto/schemas@1.28.0
  - @logto/cli@1.28.0

## 1.27.0

### Minor Changes

- 6fafcefef: add one-time token verification method to support magic link authentication

  You can now use the "one-time token" to compose magic links, and send them to the end user's email.
  With a magic link, one can register a new account or sign in directly to the application, without the need to enter a password, or input verification codes.

  You can also use magic link to invite users to your organizations.

  ### Example API request to create a one-time token

  ```bash
  POST /api/one-time-tokens
  ```

  Request payload:

  ```jsonc
  {
    "email": "user@example.com",
    // Optional. Defaults to 600 (10 mins).
    "expiresIn": 3600,
    // Optional. User will be provisioned to the specified organizations upon successful verification.
    "context": {
      "jitOrganizationIds": ["your-org-id"],
    },
  }
  ```

  ### Compose your magic link

  After you get the one-time token, you can compose a magic link and send it to the end user's email address. The magic link should at least contain the token and the user email as parameters, and should navigate to a landing page in your own application. E.g. `https://yourapp.com/landing-page`.

  Here's a simple example of what the magic link may look like:

  ```http
  https://yourapp.com/landing-page?token=YHwbXSXxQfL02IoxFqr1hGvkB13uTqcd&email=user@example.com
  ```

  Refer to [our docs](https://docs.logto.io/docs/end-user-flows/one-time-token) for more details.

- e69ea0373: feat: support custom identifier lockout (sentinel) settings

  We have introduced a new field, `sentinelPolicy`, in the `signInExperience` settings. This field allows customization of lockout settings for identifiers in your Logto application. By default, it is set to an empty object, which means the default lockout policy will apply. The properties of the new field are as follows:

  ```ts
  type SentinelPolicy = {
    maxAttempts?: number;
    lockoutDuration?: number;
  };
  ```

  1. Maximum failed attempts:

     - This limits the number of consecutive failed authentication attempts per identifier within an hour. If the limit is exceeded, the identifier will be temporarily locked out.
     - Default Value: 100

  2. Lockout duration (minutes):

     - This specifies the period during which all authentication attempts for the given identifier are blocked after exceeding the maximum failed attempts.
     - Default Value: 60 minutes

  3. Manual unblock:

     A new API endpoint has been introduced to manually unblock a specified list of identifiers. This feature is useful for administrators to unlock users who have been temporarily locked out due to exceeding the maximum failed attempts.

     Endpoint: `POST /api/sentinel-activities/delete`

     This endpoint allows for the bulk deletion of all sentinel activities within an hour in the database based on the provided identifiers, effectively unblocking them.

- 2961d355d: bump node version to ^22.14.0
- 0a76f3389: add captcha bot protection

  You can now enable CAPTCHA bot protection for your sign-in experience with providers like Google reCAPTCHA enterprise and Cloudflare Turnstile.

  To enable CAPTCHA bot protection, you need to:

  1. Go to Console > Security > CAPTCHA > Bot protection.
  2. Select the CAPTCHA provider you want to use.
  3. Configure the CAPTCHA provider.
  4. Save the settings.
  5. Enable CAPTCHA in the Security page.

  Then take a preview of your sign-in experience to see the CAPTCHA in action.

### Patch Changes

- f41938257: respond 404 for non-existing paths in `/assets`

  Our single-page application proxy now responds with a 404 for non-existing paths in `/assets` instead of falling back to the `index.html` file.

  This prevents the browser and CDN from caching the `index.html` file for non-existing paths in `/assets`, which can lead to confusion and unexpected behavior.
  Since the `/assets` path is used only for static assets, it is safe and improves the user experience.

- 7dbcedaa1: move password encyption to separate worker thread

  This update refactors the password encryption process by moving it to a separate Node.js worker thread. The Argon2i encryption method, known for its resource-intensive and time-consuming nature, is now handled in a dedicated worker. This change aims to prevent the encryption process from blocking other requests, thereby improving the overall performance and responsiveness of the application.

- cfedfb306: clean up legacy experience package

  The migration to the new experience package is now complete, offering improved flexibility and maintainability through our Experience API. (see release [1.26.0](https://github.com/logto-io/logto/releases/tag/v1.26.0) for more details)

  Key updates:

  - Removed feature flags and migration-related logic
  - Cleaned up transitional code used during gradual rollout
  - Deprecated and removed `@logto/experience-legacy` package
  - Fully adopted `@logto/experience` package with Experience API for all user interactions

  This marks the completion of our authentication UI modernization, providing a more maintainable and extensible foundation for future enhancements.

- Updated dependencies [6fafcefef]
- Updated dependencies [e69ea0373]
- Updated dependencies [2961d355d]
- Updated dependencies [0a76f3389]
- Updated dependencies [83e7be741]
- Updated dependencies [e69ea0373]
- Updated dependencies [e69ea0373]
  - @logto/experience@1.13.0
  - @logto/schemas@1.27.0
  - @logto/connector-kit@4.3.0
  - @logto/language-kit@1.2.0
  - @logto/phrases-experience@1.10.0
  - @logto/core-kit@2.6.0
  - @logto/app-insights@2.1.0
  - @logto/demo-app@1.5.0
  - @logto/console@1.24.0
  - @logto/phrases@1.19.0
  - @logto/shared@3.2.0
  - @logto/cli@1.27.0

## 1.26.0

### Minor Changes

- 13d04d776: feat: support multiple sign-up identifiers in sign-in experience

  ## New update

  Introduces a new optional field, `secondaryIdentifiers`, to the sign-in experience sign-up settings. This enhancement allows developers to specify multiple required user identifiers during the user sign-up process. Available options include `email`, `phone`, `username` and `emailOrPhone`.

  ### Explanation of the difference between `signUp.identifiers` and new `signUp.secondaryIdentifiers`

  The existing `signUp.identifiers` field represents the sign-up identifiers enabled for user sign-up and is an array type. In this legacy setup, if multiple identifiers are provided, users can complete the sign-up process using any one of them. The only multi-value case allowed is `[email, phone]`, which signifies that users can provide either an email or a phone number.

  To enhance flexibility and support multiple required sign-up identifiers, the existing `signUp.identifiers` field does not suffice. To maintain backward compatibility with existing data, we have introduced this new `secondaryIdentifiers` field.

  Unlike the `signUp.identifiers` field, the `signUp.secondaryIdentifiers` array follows an `AND` logic, meaning that all elements listed in this field are required during the sign-up process, in addition to the primary identifiers. This new field also accommodates the `emailOrPhone` case by defining an exclusive `emailOrPhone` value type, which indicates that either a phone number or an email address must be provided.

  In summary, while `identifiers` allows for optional selection among email and phone, `secondaryIdentifiers` enforces mandatory inclusion of all specified identifiers.

  ### Examples

  1. `username` as the primary identifier. In addition, user will be required to provide a verified `email` and `phone number` during the sign-up process.

  ```json
  {
    "identifiers": ["username"],
    "secondaryIdentifiers": [
      {
        "type": "email",
        "verify": true
      },
      {
        "type": "phone",
        "verify": true
      }
    ],
    "verify": true,
    "password": true
  }
  ```

  2. `username` as the primary identifier. In addition, user will be required to provide either a verified `email` or `phone number` during the sign-up process.

  ```json
  {
    "identifiers": ["username"],
    "secondaryIdentifiers": [
      {
        "type": "emailOrPhone",
        "verify": true
      }
    ],
    "verify": true,
    "password": true
  }
  ```

  3. `email` or `phone number` as the primary identifier. In addition, user will be required to provide a `username` during the sign-up process.

  ```json
  {
    "identifiers": ["email", "phone"],
    "secondaryIdentifiers": [
      {
        "type": "username",
        "verify": true
      }
    ],
    "verify": true,
    "password": false
  }
  ```

  ### Sign-in experience settings

  - `@logto/core`: Update the `/api/sign-in-experience` endpoint to support the new `secondaryIdentifiers` field in the sign-up settings.
  - `@logto/console`: Replace the sign-up identifier single selector with a multi-selector to support multiple sign-up identifiers. The order of the identifiers can be rearranged by dragging and dropping the items in the list. The first item in the list will be considered the primary identifier and stored in the `signUp.identifiers` field, while the rest will be stored in the `signUp.secondaryIdentifiers` field.

  ### End-user experience

  The sign-up flow is now split into two stages:

  - Primary identifiers (`signUp.identifiers`) are collected in the first-screen registration screen.
  - Secondary identifiers (`signUp.secondaryIdentifiers`) are requested in subsequent steps after the primary registration has been submitted.

  ## Other refactors

  We have fully decoupled the sign-up identifier settings from the sign-in methods. Developers can now require as many user identifiers as needed during the sign-up process without impacting the sign-in process.

  The following restrictions on sign-in and sign-up settings have been removed:

  1. Password requirement is now optional when `username` is configured as a sign-up identifier. However, users without passwords cannot sign in using username authentication.
  2. Removed the constraint requiring sign-up identifiers to be enabled as sign-in methods.
  3. Removed the requirement for password verification across all sign-in methods when password is enabled for sign-up.

- 3594e1316: refactor: switch to `@logto/experience` package with latest [Experience API](https://openapi.logto.io/group/endpoint-experience)

  In this release, we have transitioned the user sign-in experience from the legacy `@logto/experience-legacy` package to the latest `@logto/experience` package. This change fully adopts our new [Experience API](https://openapi.logto.io/group/endpoint-experience), enhancing the underlying architecture while maintaining the same user experience.

  - Package update: The user sign-in experience now utilizes the `@logto/experience` package by default.
    API Transition: The new package leverages our latest [Experience API](https://openapi.logto.io/group/endpoint-experience).
  - No feature changes: Users will notice no changes in functionality or experience compared to the previous implementation.

### Patch Changes

- 7b342f7ef: remove `client_id` from OIDC SSO connector's token request body for better compatibility

  This updates addresses an issue with client authentication methods in the token request process. Previously, the `client_id` was included in the request body while also using the authentication header for client credentials authentication.

  This dual method of client authentication can lead to errors with certain OIDC providers, such as Okta, which only support one authentication method at a time.

  ### Key changes

  Removal of `client_id` from request body: The `client_id` parameter has been removed from the token request body. According to the [OAuth 2.0 specification](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3), `client_id` in the body is required only for public clients.

- eb802f4c4: remove multiple sign-in experience settings restrictions

  For better customization flexibility, we have removed following restrictions in the sign-in experience "sign-in and sign-up" settings:

  1. The `password` field in sign-up settings is no longer required when username is set as the sign-up identifier. Developers may request a username without requiring a password during the sign-up process.

  Note: If username is the only sign-up identifier, users without a password will not be able to sign in. Developers or administrators should carefully configure the sign-up and sign-in settings to ensure a smooth user experience.

  Users can still set password via [account API](https://docs.logto.io/end-user-flows/account-settings/by-account-api) after sign-up.

  2. The requirement that all sign-up identifiers must also be enabled as sign-in identifiers has been removed.

- Updated dependencies [13d04d776]
- Updated dependencies [dc13cc73d]
- Updated dependencies [5da01bc47]
  - @logto/schemas@1.26.0
  - @logto/console@1.23.0
  - @logto/experience@1.12.0
  - @logto/language-kit@1.1.3
  - @logto/cli@1.26.0

## 1.25.0

### Minor Changes

- 1c7bdf9ba: add legacy password type supporting custom hasing function, credits @fre2d0m

  You can now set the type of `password_encryption_method` to `legacy`, and store info with a JSON string format (containing a hash algorithm, arguments, and an encrypted password) in the `password_encrypted` field. By doing this, you can use any hash algorithm supported by Node.js, this is useful when migrating from other password hash algorithms, especially for the ones that include salt.

  The format of the JSON string is as follows:

  ```json
  ["hash_algorithm", ["argument1", "argument2", ...], "expected_hashed_value"]
  ```

  And you can use `@` as the input password in the arguments.

  For example, if you are using SHA256 with a salt, you can store the password in the following format:

  ```json
  [
    "sha256",
    ["salt123", "@"],
    "c465f66c6ac481a7a17e9ed5b4e2e7e7288d892f12bf1c95c140901e9a70436e"
  ]
  ```

  Then when the user uses the password (`password123`), the `legacyVerify` function will use the `sha256` algorithm with the `salt123` and the input password to verify the password.

  In this case, `salt123` is the first argument, `@` is the input password, then the following code will be executed:

  ```ts
  const hash = crypto.createHash("sha256");
  hash.update("salt123" + "password123");
  const expectedHashedValue = hash.digest("hex");
  ```

- 03ea1f96c: feat: custom email templates in multiple languages via Management API

  ## Details

  Introduce localized email template customization capabilities. This update allows administrators to create and manage multiple email templates for different languages and template types (e.g., SignIn, ForgotPassword) via the management API.

  Email connectors now support automatic template selection based on the user's preferred language. If a template is not available in the user's preferred language, the default template will be used.

  - For client-side API requests, like experience API and user account API, the user's preferred language is determined by the `Accept-Language` header.
  - For server-side API requests, like organization invitation API, email language preference can be set by passing extra `locale` parameter in the `messagePayload`.
  - The email template selection logic is based on the following priority order:
    1. Find the template that matches the user's preferred language detected from the request.
    2. Find the template that matches the default language set in the sign-in experience settings.
    3. Use the default template set in the email connector settings.

  ### Management API

  - `PUT /email-templates`: Bulk create or update email templates.
  - `GET /email-templates`: List all email templates with filter by language and type support.
  - `DELETE /email-templates`: Bulk delete email templates by language and type.
  - `GET /email-templates/{id}`: Get a specific email template by ID.
  - `DELETE /email-templates/{id}`: Delete a specific email template by ID.
  - `PATCH /email-templates/{id}/details`: Update email template details by ID.

  ### Supported email connectors

  - `@logto/connector-aliyun-dm`
  - `@logto/connector-aws-ses`
  - `@logto/connector-mailgun`
  - `@logto/connector-sendgrid-email`
  - `@logto/connector-smtp`

  ### Unsupported email connectors

  The following email connectors have their templates managed at the provider side and do not support reading templates from Logto.
  The user's preferred language will be passed to the provider as the `locale` parameter in the email sending request payload. For i18n support, administrators must manage the template selection logic at the provider side.

  - `@logto/connector-postmark`
  - `@logto/connector-http-email`

- 03ea1f96c: pass additional context variables to email templates

  Enhanced email template customization by introducing additional context variables that developers can utilize in message templates. These new variables provide deeper contextual information about the authentication workflow, enabling more personalized and scenario-specific email content.

  - user: `UserInfo` - Contains basic user profile data (name, primaryEmail, etc.) for personalization
  - application: `ApplicationInfo` - Contains basic application-specific data (name, logo, etc.) for personalization
  - organization: `OrganizationInfo` - Contains basic organization-specific data (name, logo, etc.) for personalization
  - inviter: `UserInfo` - Contains basic inviter profile data (name, primaryEmail, etc.) for personalization

  | usageType                | Scenario                                                                                                                                                                                                                                                                                                                                                                      | Variables                                                                             |
  | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
  | SignIn                   | Users sign in using their email and verify by entering verification code instead of entering a password.                                                                                                                                                                                                                                                                      | code: string<br/>application: `ApplicationInfo`<br/>organization?: `OrganizationInfo` |
  | Register                 | Users create an account using their email and verify it by entering a verification code sent by Logto to their email.                                                                                                                                                                                                                                                         | code: string<br/>application: `ApplicationInfo`<br/>organization?: `OrganizationInfo` |
  | ForgotPassword           | If users forget their password during login, they can choose to verify their identity using the email they've already verified with Logto.                                                                                                                                                                                                                                    | code: string<br/>application: `ApplicationInfo`<br/>organization?: `OrganizationInfo` |
  | Generic                  | This template can be used as a general backup option for various scenarios, including testing connector configurations and so on.                                                                                                                                                                                                                                             | code: string                                                                          |
  | OrganizationInvitation   | Use this template to send users an invitation link to join the organization.                                                                                                                                                                                                                                                                                                  | link: string<br/>organization: `OrganizationInfo`<br/>inviter?: `UserInfo`            |
  | UserPermissionValidation | During app usage, there may be some high-risk operations or operations with a relatively high risk level that require additional user verification, such as bank transfers, deleting resources in use, and canceling memberships. The `UserPermissionValidation` template can be used to define the content of the email verification code users receive in these situations. | code: string<br/>user: `UserInfo`<br/>application?: `ApplicationInfo`                 |
  | BindNewIdentifier        | When a user modifies their profile, they may bind an email address to their current account. In this case, the `BindNewIdentifier` template can be used to customize the content of the verification email.                                                                                                                                                                   | code: string<br/>user: `UserInfo`<br/>application?: `ApplicationInfo`                 |

  Check [Email templates](https://docs.logto.io/connectors/email-connectors/email-templates) for more information on how to use these new context variables in your email templates.

- c87424025: feat: support role names alongside role IDs in organization user role assignment/replacement with merge capability

  This update enhances organization user role management APIs to support role assignment by both names and IDs, improving integration flexibility.

  ### Updates

  - Added `organizationRoleNames` parameter to:
    - POST `/api/organizations/{id}/users/{userId}/roles` (assign roles)
    - PUT `/api/organizations/{id}/users/{userId}/roles` (replace roles)
  - Make both `organizationRoleNames` and `organizationRoleIds` optional in the above APIs
    - If both are not provided, or empty, an invalid data error will be thrown
  - Merge logic when both parameters are provided:
    - Combines roles from `organizationRoleNames` and `organizationRoleIds`
    - Automatically deduplicates entries
    - Validates all names/IDs exist before applying changes
  - Maintains backward compatibility with existing integrations using role IDs

### Patch Changes

- bca4177c6: add `AuthnStatement` to SAML app assertion response
- 20b61e05e: refactor: adjust TOTP secret length to 20 bytes

  Update the TOTP secret generation to use 20 bytes (160 bits), following the recommendation in RFC 6238 (TOTP) and RFC 4226 (HOTP).

  This aligns with the standard secret length used by most 2FA applications and provides better security while maintaining compatibility with existing TOTP validators.

  Reference:

  - RFC 6238 (TOTP) Section 5.1: https://www.rfc-editor.org/rfc/rfc6238#section-5.1
  - RFC 4226 (HOTP) Section 4, Requirement 6: https://www.rfc-editor.org/rfc/rfc4226#section-4

- f15602f19: fix: incorrect pagination behavior in organization role scopes APIs

  - Fix `/api/organization-roles/{id}/scopes` and `/api/organization-roles/{id}/resource-scopes` endpoints to:
    - Return all scopes when no pagination parameters are provided
    - Support optional pagination when query parameters are present
  - Fix Console to properly display all organization role scopes on the organization template page

- Updated dependencies [1c7bdf9ba]
- Updated dependencies [b0135bcd3]
- Updated dependencies [31adfb6ac]
  - @logto/schemas@1.25.0
  - @logto/connector-kit@4.2.0
  - @logto/console@1.22.1
  - @logto/cli@1.25.0

## 1.24.1

### Patch Changes

- e7accfdab: prevent i18n context contamination by using request-scoped instances

  This bug fix resolves a concurrency issue in i18n handling by moving from a global i18next instance to request-scoped instances.

  ### Problem

  When handling concurrent requests:

  - The shared global `i18next` instance's language was being modified via `changeLanguage()` calls.
  - This could lead to race conditions where requests might receive translations in unexpected languages.
  - Particularly problematic in multi-tenant environments with different language requirements.

  ### Solution

  - Updated `koaI18next` middleware to create a cloned i18next instance for each request.
  - Attach the request-scoped instance to Koa context (`ctx.i18n`) All subsequent middleware and handlers should now use `ctx.i18n` instead of the global `i18next` instance.
  - Maintains the global instance for initialization while preventing cross-request contamination

- a5990ec57: fixes an incorrect condition check in the verification code flow where `isNewIdentifier` was using inverted logic for email and phone comparisons.

  ### Changes

  - Corrected `isNewIdentifier` boolean logic to use `identifier.value !== user.primaryEmail` for email checks
  - Fixed phone number comparison to properly use `identifier.value !== user.primaryPhone`

  ### Impact

  This fixes a regression where:

  - Verification codes for existing emails/phones were incorrectly using the`BindNewIdentifier` template
  - New identifiers were mistakenly getting the `UserPermissionValidation` template
  - Affected both email and phone verification flows

- e11e57de8: bump dependencies for security update
- d44007faa: apply custom domain to SAML SSO and SAML applications
- Updated dependencies [096367ff5]
- Updated dependencies [28643c1f1]
- Updated dependencies [bd18da4cf]
- Updated dependencies [0b785ee0d]
- Updated dependencies [cb261024b]
- Updated dependencies [5086f4bd2]
- Updated dependencies [e11e57de8]
- Updated dependencies [d44007faa]
  - @logto/console@1.22.0
  - @logto/experience@1.11.2
  - @logto/experience-legacy@1.11.1
  - @logto/phrases@1.18.0
  - @logto/cli@1.24.1
  - @logto/connector-kit@4.1.1
  - @logto/language-kit@1.1.1
  - @logto/core-kit@2.5.4
  - @logto/app-insights@2.0.1
  - @logto/schemas@1.24.1
  - @logto/shared@3.1.4
  - @logto/demo-app@1.4.2
  - @logto/phrases-experience@1.9.1

## 1.24.0

### Minor Changes

- 1337669e1: add support on SAML applications

  Logto now supports acting as a SAML identity provider (IdP), enabling enterprise users to achieve secure Single Sign-On (SSO) through the standardized SAML protocol. Key features include:

  - Full support for SAML 2.0 protocol
  - Flexible attribute mapping configuration
  - Metadata auto-configuration support
  - Enterprise-grade encryption and signing

  [View full documentation](https://docs.logto.io/integrate-logto/saml-app) for more details.

### Patch Changes

- bf2d3007c: fix(core): trigger the `Organization.Membership.Updated` webhook when a user accepts an invitation and join an organization.

  Added a new `Organization.Membership.Accepted` webhook event in the `PUT /api/organization-invitations/{id}/status` endpoint. This event will be triggered when the organization-invitation status is updated to `accepted`, and user is added to the organization.

- Updated dependencies [1337669e1]
  - @logto/console@1.21.0
  - @logto/phrases@1.17.0
  - @logto/schemas@1.24.0
  - @logto/cli@1.24.0

## 1.23.1

### Patch Changes

- 39cef8ea4: support custom endpoint and addressing style for S3
- Updated dependencies [d2468683c]
  - @logto/experience@1.11.1
  - @logto/schemas@1.23.1
  - @logto/cli@1.23.1

## 1.23.0

### Minor Changes

- f1b1d9e95: new MFA prompt policy

  You can now cutomize the MFA prompt policy in the Console.

  First, choose if you want to enable **Require MFA**:

  - **Enable**: Users will be prompted to set up MFA during the sign-in process which cannot be skipped. If the user fails to set up MFA or deletes their MFA settings, they will be locked out of their account until they set up MFA again.
  - **Disable**: Users can skip the MFA setup process during sign-up flow.

  If you choose to **Disable**, you can choose the MFA setup prompt:

  - Do not ask users to set up MFA.
  - Ask users to set up MFA during registration (skippable, one-time prompt). **The same prompt as previous policy (UserControlled)**
  - Ask users to set up MFA on their sign-in after registration (skippable, one-time prompt)

### Patch Changes

- 239b81e31: loose redirect uri restrictions

  Logto has been following the industry best practices for OAuth2.0 and OIDC from the start. However, in the real world, there are things we cannot control, like third-party services or operation systems like Windows.

  This update relaxes restrictions on redirect URIs to allow the following:

  1. A mix of native and HTTP(S) redirect URIs. For example, a native app can now use a redirect URI like `https://example.com`.
  2. Native schemes without a period (`.`). For example, `myapp://callback` is now allowed.

  When such URIs are configured, Logto Console will display a prominent warning. This change is backward-compatible and will not affect existing applications.

  We hope this change will make it easier for you to integrate Logto with your applications.

- Updated dependencies [217858950]
- Updated dependencies [f1b1d9e95]
- Updated dependencies [239b81e31]
  - @logto/cli@1.23.0
  - @logto/experience-legacy@1.11.0
  - @logto/experience@1.11.0
  - @logto/console@1.20.0
  - @logto/phrases@1.16.0
  - @logto/schemas@1.23.0
  - @logto/core-kit@2.5.2

## 1.22.0

### Minor Changes

- 640425414: add `trustUnverifiedEmail` setting for the Microsoft EntraID OIDC SSO connector

  Since we launched the **EntraID OIDC SSO connector** we have received several feedbacks that their customer's email address can not be populated to Logto's user profile when signing up through the EntraID OIDC SSO connector.
  This is because Logto only syncs verified email addresses, meaning the `email_verified` claim must be `true` in the user info response from the OIDC provider.

  However, based on Microsoft's documentation, since the user's email address in manually managed by the organization, they are not verified guaranteed. This means that the `email_verified` claim will not be included in their user info response.

  To address this issue, we have added a new `trustUnverifiedEmail` exclusively for the Microsoft EntraID OIDC SSO connector. When this setting is enabled, Logto will trust the email address provided by the Microsoft EntraID OIDC SSO connector even if the `email_verified` claim is not included in the user info response. This will allow users to sign up and log in to Logto using their email address without any issues. Please note this may introduce a security risk as the email address is not verified by the OIDC provider. You should only enable this setting if you trust the email address provided by the Microsoft EntraID OIDC SSO connector.

  You can configure this setting in the **EntraID OIDC SSO connector** settings page in the Logto console or through the management API.

- 640425414: display support email and website info on experience error pages.

  Added support email and website info to the error pages of the experience app. E.g. when a user tries to access a page that doesn't exist, or when the social session is not found in a social callback page. This will help users to contact support easily when they encounter an error.

  You may configure the support email and website info in the sign-in experience settings page in the Logto console or through the management API.

- 7ebef18e3: add account api

  Introduce the new Account API, designed to give end users direct API access without needing to go through the Management API, here is the highlights:

  1. Direct access: The Account API empowers end users to directly access and manage their own account profile without requiring the relay of Management API.
  2. User profile and identities management: Users can fully manage their profiles and security settings, including the ability to update identity information like email, phone, and password, as well as manage social connections. MFA and SSO support are coming soon.
  3. Global access control: Admin has full, global control over access settings, can customize each fields.
  4. Seamless authorization: Authorizing is easier than ever! Simply use `client.getAccessToken()` to obtain an opaque access token for OP (Logto), and attach it to the Authorization header as `Bearer <access_token>`.

  ## Get started

  > ![Note]
  > Go to the [Logto Docs](https://bump.sh/logto/doc/logto-user-api) to find full API reference.

  1. Use `/api/account-center` endpoint to enable the feature, for security reason, it is disabled by default. And set fields permission for each field.
  2. Use `client.getAccessToken()` to get the access token.
  3. Attach the access token to the Authorization header of your request, and start interacting with the Account API directly from the frontend.
  4. You may need to setup `logto-verification-id` header as an additional verification for some requests related to identity verification.

  ## What you can do with Account API

  1. Get user account profile
  2. Update basic information including name, avatar, username and other profile information
  3. Update password
  4. Update primary email
  5. Update primary phone
  6. Manage social identities

- 640425414: add unknown session redirect url in the sign-in experience settings

  In certain cases, Logto may be unable to properly identify a user’s authentication session when they land on the sign-in page. This can happen if the session has expired, if the user bookmarks the sign-in URL for future access, or if they directly share the sign-in link. By default, an "unknown session" 404 error is displayed.

  To improve user experience, we have added a new `unknownSessionRedirectUrl` field in the sign-in experience settings.You can configure this field to redirect users to a custom URL when an unknown session is detected. This will help users to easily navigate to your client application or website and reinitiate the authentication process automatically.

### Patch Changes

- Updated dependencies [640425414]
- Updated dependencies [640425414]
- Updated dependencies [7ebef18e3]
- Updated dependencies [640425414]
  - @logto/console@1.19.0
  - @logto/phrases@1.15.0
  - @logto/experience@1.10.0
  - @logto/experience-legacy@1.10.0
  - @logto/phrases-experience@1.9.0
  - @logto/schemas@1.22.0
  - @logto/connector-kit@4.1.0
  - @logto/cli@1.22.0

## 1.21.0

### Minor Changes

- eae1c30e2: add GatewayAPI SMS connector

### Patch Changes

- bc2a0ac03: add environment variable to override default database connection timeout

  By default, out database connection timeout is set to 5 seconds, which might not be enough for some network conditions. This change allows users to override the default value by setting the `DATABASE_CONNECTION_TIMEOUT` environment variable.

- 3c993d59c: fix an issue that prevent mp4 video from playing in custom sign-in pages on Safari browser

  Safari browser uses range request to fetch video data, but it was not supported by the `koa-serve-custom-ui-assets` middleware in core. This prevents our users who want to build custom sign-in pages with video background. In order to fix this, we need to partially read the video file stream based on the `range` request header, and set proper response headers and status code (206).

- Updated dependencies [bc2a0ac03]
- Updated dependencies [3c993d59c]
- Updated dependencies [5bb937505]
  - @logto/shared@3.1.2
  - @logto/phrases@1.14.1
  - @logto/console@1.18.1
  - @logto/schemas@1.21.0
  - @logto/cli@1.21.0

## 1.20.0

### Minor Changes

- e0326c96c: Add personal access token (PAT)

  Personal access tokens (PATs) provide a secure way for users to grant access tokens without using their credentials and interactive sign-in.

  You can create a PAT by going to the user's detail page in Console or using the Management API `POST /users/:userId/personal-access-tokens`.

  To use a PAT, call the token exchange endpoint `POST /oidc/token` with the following parameters:

  1. `grant_type`: REQUIRED. The value of this parameter must be `urn:ietf:params:oauth:grant-type:token-exchange` indicates that a token exchange is being performed.
  2. `resource`: OPTIONAL. The resource indicator, the same as other token requests.
  3. `scope`: OPTIONAL. The requested scopes, the same as other token requests.
  4. `subject_token`: REQUIRED. The user's PAT.
  5. `subject_token_type`: REQUIRED. The type of the security token provided in the `subject_token` parameter. The value of this parameter must be `urn:logto:token-type:personal_access_token`.
  6. `client_id`: REQUIRED. The client identifier of the client application that is making the request, the returned access token will contain this client_id claim.

  And the response will be a JSON object with the following properties:

  1. `access_token`: REQUIRED. The access token of the user, which is the same as other token requests like `authorization_code` or `refresh_token`.
  2. `issued_token_type`: REQUIRED. The type of the issued token. The value of this parameter must be `urn:ietf:params:oauth:token-type:access_token`.
  3. `token_type`: REQUIRED. The type of the token. The value of this parameter must be `Bearer`.
  4. `expires_in`: REQUIRED. The lifetime in seconds of the access token.
  5. `scope`: OPTIONAL. The scopes of the access token.

- 3d3a22030: add support for additional first screen options

  This feature introduces new first screen options, allowing developers to customize the initial screen presented to users. In addition to the existing `sign_in` and `register` options, the following first screen choices are now supported:

  - `identifier:sign_in`: Only display specific identifier-based sign-in methods to users.
  - `identifier:register`: Only display specific identifier-based registration methods to users.
  - `reset_password`: Allow users to directly access the password reset page.
  - `single_sign_on`: Allow users to directly access the single sign-on (SSO) page.

  Example:

  ```javascript
  // Example usage (React project using React SDK)
  void signIn({
    redirectUri,
    firstScreen: "identifier:sign_in",
    /**
     * Optional. Specifies which sign-in methods to display on the identifier sign-in page.
     * If not specified, the default sign-in experience configuration will be used.
     * This option is effective when the `firstScreen` value is `identifier:sign_in`, `identifier:register`, or `reset_password`.
     */
    identifiers: ["email", "phone"],
  });
  ```

- 25187ef63: add support for `login_hint` parameter in sign-in method

  This feature allows you to provide a suggested identifier (email, phone, or username) for the user, improving the sign-in experience especially in scenarios where the user's identifier is known or can be inferred.

  Example:

  ```javascript
  // Example usage (React project using React SDK)
  void signIn({
    redirectUri,
    loginHint: "user@example.com",
    firstScreen: "signIn", // or 'register'
  });
  ```

- b837efead: add access deny method to the custom token claims script

  Introduce a new `api` parameter to the custom token claims script. This parameter is used to provide more access control context over the token exchange process.
  Use `api.denyAccess()` to reject the token exchange request. Use this method to implement your own access control logics.

  ```javascript
  const getCustomJwtClaims: async ({ api }) => {
    // Reject the token request, with a custom error message
    return api.denyAccess('Access denied');
  }
  ```

- cc346b4e0: add password policy checking api

  Add `POST /api/sign-in-exp/default/check-password` API to check if the password meets the password policy configured in the default sign-in experience. A user ID is required for this API if rejects user info is enabled in the password policy.

  Here's a non-normative example of the request and response:

  ```http
  POST /api/sign-in-exp/default/check-password
  Content-Type: application/json

  {
    "password": "123",
    "userId": "some-user-id"
  }
  ```

  ```http
  400 Bad Request
  Content-Type: application/json

  {
    "result": false,
    "issues": [
      { "code": "password_rejected.too_short" },
      { "code": "password_rejected.character_types" },
      { "code": "password_rejected.restricted.sequence" }
    ]
  }
  ```

### Patch Changes

- a748fc85b: fix: add `hasPassword` field to user API response
- fae8725a4: improve RTL language support
- 6951e3157: introduce new `parse_error` query parameter flag. The value of `parse_error` can only be `false`.

  By default, Logto returns the parsed error code and error description in all the `RequestError` error responses. This is to ensure the error responses are consistent and easy to understand.

  However, when integrating Logto with Google OAuth, the error response body containing `code` will be rejected by Google. `code` is considered as a reserved OIDC key, can't be used as the error code key in the error response body.

  To workaround this, we add a new `parse_error` query parameter flag. When parsing the OIDC error body, if the `parse_error` is set to false, only oidc error body will be returned.

  example:

  ```curl
  curl -X POST "http://localhost:3001/oidc/token?parse_error=false"
  ```

  ```json
  {
    "error": "invalid_grant",
    "error_description": "Invalid value for parameter 'code': 'invalid_code'."
  }
  ```

- 5aab7c01b: prevent user registration and profile fulfillment with SSO-only email domains

  Emails associated with SSO-enabled domains should only be used through the SSO authentication process.

  Bug fix:

  - Creating a new user with a verification record that contains an SSO-only email domain should return a 422 `RequestError` with the error code `session.sso_required`.
  - Updating a user profile with an SSO-only email domain should return a 422 `RequestError` with the error code `session.sso_required`.

- Updated dependencies [f150a67d5]
- Updated dependencies [ee1947ac4]
- Updated dependencies [baa8577c4]
- Updated dependencies [ff6b304ba]
- Updated dependencies [e0326c96c]
- Updated dependencies [3d3a22030]
- Updated dependencies [25187ef63]
- Updated dependencies [479d5895a]
- Updated dependencies [262661677]
- Updated dependencies [3b9714b99]
- Updated dependencies [ab90f43db]
- Updated dependencies [fae8725a4]
- Updated dependencies [0183d0c33]
- Updated dependencies [b837efead]
- Updated dependencies [53060c203]
  - @logto/console@1.18.0
  - @logto/phrases@1.14.0
  - @logto/experience@1.9.0
  - @logto/schemas@1.20.0
  - @logto/experience-legacy@1.9.0
  - @logto/demo-app@1.4.1
  - @logto/cli@1.20.0
  - @logto/phrases-experience@1.8.0

## 1.19.0

### Minor Changes

- 6477c6dee: add `custom_data` to applications

  Introduce a new property `custom_data` to the `Application` schema. This property is an arbitrary object that can be used to store custom data for an application.

  Added a new API to update the custom data of an application:

  - `PATCH /applications/:applicationId/custom-data`

- 3a839f6d6: support organization logo and sign-in experience override

  Now it's able to set light and dark logos for organizations. You can upload the logos in the organization settings page.

  Also, it's possible to override the sign-in experience logo from an organization. Simply add the `organization_id` parameter to the authentication request. In most Logto SDKs, it can be done by using the `extraParams` field in the `signIn` method.

  For example, in the JavaScript SDK:

  ```ts
  import LogtoClient from "@logto/client";

  const logtoClient = new LogtoClient(/* your configuration */);

  logtoClient.signIn({
    redirectUri: "https://your-app.com/callback",
    extraParams: {
      organization_id: "<organization-id>",
    },
  });
  ```

  The value `<organization-id>` can be found in the organization settings page.

  If you could not find the `extraParams` field in the SDK you are using, please let us know.

- 62f5e5e0c: support app-level branding

  You can now set logos, favicons, and colors for your app. These settings will be used in the sign-in experience when the app initiates the authentication flow. For apps that have no branding settings, the omni sign-in experience branding will be used.

  If `organization_id` is provided in the authentication request, the app-level branding settings will be overridden by the organization's branding settings, if available.

- 18c8fdf01: implement token exchange for user impersonation

  Added support for user impersonation via token exchange:

  1. New endpoint: `POST /subject-tokens` (Management API)
     - Request body: `{ "userId": "<user-id>" }`
     - Returns a subject token
  2. Enhanced `POST /oidc/token` endpoint (OIDC API)
     - Supports new grant type: `urn:ietf:params:oauth:grant-type:token-exchange`
     - Request body:
       ```json
       {
         "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
         "subject_token": "<subject-token>",
         "subject_token_type": "urn:ietf:params:oauth:token-type:access_token",
         "client_id": "<client-id>"
       }
       ```
     - Returns an impersonated access token

  Refer to documentation for usage examples and the [Token Exchange RFC](https://tools.ietf.org/html/rfc8693) for more details.

- d203c8d2f: support experience data server-side rendering

  Logto now injects the sign-in experience settings and phrases into the `index.html` file for better first-screen performance. The experience app will still fetch the settings and phrases from the server if:

  - The server didn't inject the settings and phrases.
  - The parameters in the URL are different from server-rendered data.

- b188bb161: support multiple app secrets with expiration

  Now secure apps (machine-to-machine, traditional web, Protected) can have multiple app secrets with expiration. This allows for secret rotation and provides an even safer experience.

  To manage your application secrets, go to Logto Console -> Applications -> Application Details -> Endpoints & Credentials.

  We've also added a set of Management APIs (`/api/applications/{id}/secrets`) for this purpose.

  > [!Important]
  > You can still use existing app secrets for client authentication, but it is recommended to delete the old ones and create new secrets with expiration for enhanced security.

- b91ec0cd6: update the jsonb field update mode from `merge` to `replace` for the `PATCH /application/:id` endpoint.
  remove the `deepPartial` statement from the `PATCH /application/:id` endpoint payload guard.

  For all the jsonb typed fields in the application entity, the update mode is now `replace` instead of `merge`. This means that when you send a `PATCH` request to update an application, the jsonb fields will be replaced with the new values instead of merging them.

  This change is to make the request behavior more strict aligned with the restful API principles for a `PATCH` request.

- d56bc2f73: add support for new password digest algorithm argon2d and argon2id

  In `POST /users`, the `passwordAlgorithm` field now accepts `Argon2d` and `Argon2id`.

  Users with those algorithms will be migrated to `Argon2i` upon succussful sign in.

- 510f681fa: use tsup for building

  We've updated some of the packages to use `tsup` for building. This will make the build process faster, and should not affect the functionality of the packages.

  Use minor version bump to catch your attention.

### Patch Changes

- 84f7e13a2: use native OpenAPI OAuth 2 security schema

  The built-in OpenAPI OAuth 2 security schema is now used instead of the custom HTTP header-based security schema. This change improves compatibility with OpenAPI tools and libraries that support OAuth 2.

- f76252e0d: fix the status code 404 error in webhook events payload

  Impact webhook events:

  - `Role.Scopes.Updated`
  - `Organizations.Membership.Updates`

  Issue: These webhook event payloads were returning a API response status code of 404 when the webhook was triggered.
  Expected: A status code of 200 should be returned, as we only trigger the webhook when the request is successful.
  Fix: All webhook event contexts should be created and inserted into the webhook pipeline after the response body and status code are properly set.

- Updated dependencies [6477c6dee]
- Updated dependencies [3aa7e57b3]
- Updated dependencies [3a839f6d6]
- Updated dependencies [b91ec0cd6]
- Updated dependencies [3a839f6d6]
- Updated dependencies [62f5e5e0c]
- Updated dependencies [d203c8d2f]
- Updated dependencies [2d0502a42]
- Updated dependencies [3bf756f2b]
- Updated dependencies [b188bb161]
- Updated dependencies [62f5e5e0c]
- Updated dependencies [d56bc2f73]
- Updated dependencies [510f681fa]
  - @logto/schemas@1.19.0
  - @logto/console@1.17.0
  - @logto/experience@1.8.0
  - @logto/phrases@1.13.0
  - @logto/demo-app@1.4.0
  - @logto/cli@1.19.0

## 1.18.0

### Minor Changes

- 942780fcf: support Google One Tap

  - core: `GET /api/.well-known/sign-in-exp` now returns `googleOneTap` field with the configuration when available
  - core: add Google Sign-In (GSI) url to the security headers
  - core: verify Google One Tap CSRF token in `verifySocialIdentity()`
  - phrases: add Google One Tap phrases
  - schemas: migrate sign-in experience types from core to schemas

- 754d0e134: pagination is now optional for `GET /api/organizations/:id/users/:userId/roles`

  The default pagination is now removed. This isn't considered a breaking change, but we marked it as minor to get your attention.

- 87615d58c: support machine-to-machine apps for organizations

  This feature allows machine-to-machine apps to be associated with organizations, and be assigned with organization roles.

  ### Console

  - Add a new "machine-to-machine" type to organization roles. All existing roles are now "user" type.
  - You can manage machine-to-machine apps in the organization details page -> Machine-to-machine apps section.
  - You can view the associated organizations in the machine-to-machine app details page.

  ### OpenID Connect grant

  The `client_credentials` grant type is now supported for organizations. You can use this grant type to obtain an access token for an organization.

  ### Management API

  A set of new endpoints are added to the Management API:

  - `/api/organizations/{id}/applications` to manage machine-to-machine apps.
  - `/api/organizations/{id}/applications/{applicationId}` to manage a specific machine-to-machine app in an organization.
  - `/api/applications/{id}/organizations` to view the associated organizations of a machine-to-machine app.

- 061a30a87: support agree to terms polices for Logto’s sign-in experiences

  - Automatic: Users automatically agree to terms by continuing to use the service
  - ManualRegistrationOnly: Users must agree to terms by checking a box during registration, and don't need to agree when signing in
  - Manual: Users must agree to terms by checking a box during registration or signing in

- ef21c7a99: support per-organization multi-factor authentication requirement

  An organization can now require its member to have multi-factor authentication (MFA) configured. If an organization has this requirement and a member does not have MFA configured, the member will not be able to fetch the organization access token.

- b52609a1e: add `hasPassword` to custom JWT user context
- efa884c40: feature: just-in-time user provisioning for organizations

  This feature allows users to automatically join the organization and be assigned roles upon their first sign-in through some authentication methods. You can set requirements to meet for just-in-time provisioning.

  ### Email domains

  New users will automatically join organizations with just-in-time provisioning if they:

  - Sign up with verified email addresses, or;
  - Use social sign-in with verified email addresses.

  This applies to organizations that have the same email domain configured.

  To enable this feature, you can add email domain via the Management API or the Logto Console:

  - We added the following new endpoints to the Management API:
    - `GET /organizations/{organizationId}/jit/email-domains`
    - `POST /organizations/{organizationId}/jit/email-domains`
    - `PUT /organizations/{organizationId}/jit/email-domains`
    - `DELETE /organizations/{organizationId}/jit/email-domains/{emailDomain}`
  - In the Logto Console, you can manage email domains in the organization details page -> "Just-in-time provisioning" section.

  ### SSO connectors

  New or existing users signing in through enterprise SSO for the first time will automatically join organizations that have just-in-time provisioning configured for the SSO connector.

  To enable this feature, you can add SSO connectors via the Management API or the Logto Console:

  - We added the following new endpoints to the Management API:
    - `GET /organizations/{organizationId}/jit/sso-connectors`
    - `POST /organizations/{organizationId}/jit/sso-connectors`
    - `PUT /organizations/{organizationId}/jit/sso-connectors`
    - `DELETE /organizations/{organizationId}/jit/sso-connectors/{ssoConnectorId}`
  - In the Logto Console, you can manage SSO connectors in the organization details page -> "Just-in-time provisioning" section.

  ### Default organization roles

  You can also configure the default roles for users provisioned via this feature. The default roles will be assigned to the user when they are provisioned.

  To enable this feature, you can set the default roles via the Management API or the Logto Console:

  - We added the following new endpoints to the Management API:
    - `GET /organizations/{organizationId}/jit/roles`
    - `POST /organizations/{organizationId}/jit/roles`
    - `PUT /organizations/{organizationId}/jit/roles`
    - `DELETE /organizations/{organizationId}/jit/roles/{organizationRoleId}`
  - In the Logto Console, you can manage default roles in the organization details page -> "Just-in-time provisioning" section.

- b50ba0b7e: enable backchannel logout support

  Enable the support of [OpenID Connect Back-Channel Logout 1.0](https://openid.net/specs/openid-connect-backchannel-1_0.html).

  To register for backchannel logout, navigate to the application details page in the Logto Console and locate the "Backchannel logout" section. Enter the backchannel logout URL of your RP and click "Save".

  You can also enable session requirements for backchannel logout. When enabled, Logto will include the `sid` claim in the logout token.

  For programmatic registration, you can set the `backchannelLogoutUri` and `backchannelLogoutSessionRequired` properties in the application `oidcClientMetadata` object.

### Patch Changes

- d60f6ce48: build `operationId` for Management API in OpenAPI response (credit to @mostafa)

  As per [the specification](https://swagger.io/docs/specification/paths-and-operations/):

  > `operationId` is an optional unique string used to identify an operation. If provided, these IDs must be unique among all operations described in your API.

  This greatly simplifies the creation of client SDKs in different languages, because it generates more meaningful function names instead of auto-generated ones, like the following examples:

  ```diff
  - org, _, err := s.Client.OrganizationsAPI.ApiOrganizationsIdGet(ctx, req.GetId()).Execute()
  + org, _, err := s.Client.OrganizationsAPI.GetOrganization(ctx, req.GetId()).Execute()
  ```

  ```diff
  - users, _, err := s.Client.OrganizationsAPI.ApiOrganizationsIdUsersGet(ctx, req.GetId()).Execute()
  + users, _, err := s.Client.OrganizationsAPI.ListOrganizationUsers(ctx, req.GetId()).Execute()
  ```

- 7a279be1f: add user detail data payload to the `User.Deleted` webhook event
- d51e839cd: fix OpenAPI schema returned by the `GET /api/swagger.json` endpoint

  1. The `:` character is invalid in parameter names, such as `organizationId:root`. These characters have been replaced with `-`.
  2. The `tenantId` parameter of the `/api/.well-known/endpoints/{tenantId}` route was missing from the generated OpenAPI spec document, resulting in validation errors. This has been fixed.

- Updated dependencies [6308ee185]
- Updated dependencies [15953609b]
- Updated dependencies [6308ee185]
- Updated dependencies [eacec10ac]
- Updated dependencies [942780fcf]
- Updated dependencies [f78b1768e]
- Updated dependencies [87615d58c]
- Updated dependencies [9f33d997b]
- Updated dependencies [06ef19905]
- Updated dependencies [061a30a87]
- Updated dependencies [ead51e555]
- Updated dependencies [af44e87eb]
- Updated dependencies [ef21c7a99]
- Updated dependencies [136320584]
- Updated dependencies [0ef712e4e]
- Updated dependencies [50c35a214]
- Updated dependencies [15953609b]
- Updated dependencies [b52609a1e]
- Updated dependencies [efa884c40]
- Updated dependencies [b50ba0b7e]
- Updated dependencies [d81e13d21]
  - @logto/connector-kit@4.0.0
  - @logto/console@1.16.0
  - @logto/phrases@1.12.0
  - @logto/schemas@1.18.0
  - @logto/demo-app@1.3.0
  - @logto/phrases-experience@1.7.0
  - @logto/experience@1.7.0
  - @logto/cli@1.18.0

## 1.17.0

### Minor Changes

- b5104d8c1: add new webhook events

  We introduce a new event type `DataHook` to unlock a series of events that can be triggered by data updates (mostly Management API):

  - User.Created
  - User.Deleted
  - User.Data.Updated
  - User.SuspensionStatus.Updated
  - Role.Created
  - Role.Deleted
  - Role.Data.Updated
  - Role.Scopes.Updated
  - Scope.Created
  - Scope.Deleted
  - Scope.Data.Updated
  - Organization.Created
  - Organization.Deleted
  - Organization.Data.Updated
  - Organization.Membership.Updated
  - OrganizationRole.Created
  - OrganizationRole.Deleted
  - OrganizationRole.Data.Updated
  - OrganizationRole.Scopes.Updated
  - OrganizationScope.Created
  - OrganizationScope.Deleted
  - OrganizationScope.Data.Updated

  DataHook events are triggered when the data associated with the event is updated via management API request or user interaction actions.

  ### Management API triggered events

  | API endpoint                                               | Event                                                       |
  | ---------------------------------------------------------- | ----------------------------------------------------------- |
  | POST /users                                                | User.Created                                                |
  | DELETE /users/:userId                                      | User.Deleted                                                |
  | PATCH /users/:userId                                       | User.Data.Updated                                           |
  | PATCH /users/:userId/custom-data                           | User.Data.Updated                                           |
  | PATCH /users/:userId/profile                               | User.Data.Updated                                           |
  | PATCH /users/:userId/password                              | User.Data.Updated                                           |
  | PATCH /users/:userId/is-suspended                          | User.SuspensionStatus.Updated                               |
  | POST /roles                                                | Role.Created, (Role.Scopes.Update)                          |
  | DELETE /roles/:id                                          | Role.Deleted                                                |
  | PATCH /roles/:id                                           | Role.Data.Updated                                           |
  | POST /roles/:id/scopes                                     | Role.Scopes.Updated                                         |
  | DELETE /roles/:id/scopes/:scopeId                          | Role.Scopes.Updated                                         |
  | POST /resources/:resourceId/scopes                         | Scope.Created                                               |
  | DELETE /resources/:resourceId/scopes/:scopeId              | Scope.Deleted                                               |
  | PATCH /resources/:resourceId/scopes/:scopeId               | Scope.Data.Updated                                          |
  | POST /organizations                                        | Organization.Created                                        |
  | DELETE /organizations/:id                                  | Organization.Deleted                                        |
  | PATCH /organizations/:id                                   | Organization.Data.Updated                                   |
  | PUT /organizations/:id/users                               | Organization.Membership.Updated                             |
  | POST /organizations/:id/users                              | Organization.Membership.Updated                             |
  | DELETE /organizations/:id/users/:userId                    | Organization.Membership.Updated                             |
  | POST /organization-roles                                   | OrganizationRole.Created, (OrganizationRole.Scopes.Updated) |
  | DELETE /organization-roles/:id                             | OrganizationRole.Deleted                                    |
  | PATCH /organization-roles/:id                              | OrganizationRole.Data.Updated                               |
  | POST /organization-scopes                                  | OrganizationScope.Created                                   |
  | DELETE /organization-scopes/:id                            | OrganizationScope.Deleted                                   |
  | PATCH /organization-scopes/:id                             | OrganizationScope.Data.Updated                              |
  | PUT /organization-roles/:id/scopes                         | OrganizationRole.Scopes.Updated                             |
  | POST /organization-roles/:id/scopes                        | OrganizationRole.Scopes.Updated                             |
  | DELETE /organization-roles/:id/scopes/:organizationScopeId | OrganizationRole.Scopes.Updated                             |

  ### User interaction triggered events

  | User interaction action  | Event             |
  | ------------------------ | ----------------- |
  | User email/phone linking | User.Data.Updated |
  | User MFAs linking        | User.Data.Updated |
  | User social/SSO linking  | User.Data.Updated |
  | User password reset      | User.Data.Updated |
  | User registration        | User.Created      |

- 0c70d65c7: define new `sso_identities` user claim to the userinfo endpoint response

  - Define a new `sso_identities` user claim that will be used to store the user's SSO identities. The claim will be an array of objects with the following properties:
    - `details`: detailed user info returned from the SSO provider.
    - `issuer`: the issuer of the SSO provider.
    - `identityId`: the user id of the user in the SSO provider.
  - The new claims will share the same scope as the social `identities` claim.
  - When the user `identities` scope is requested, the new `sso_identities` claim will be returned along with the `identities` claim in the userinfo endpoint response.

- 76fd33b7e: support default roles for users

### Patch Changes

- 558986d28: update documentation reference links
- 458746c9a: fix Microsoft EntraID OIDC SSO connector invalid authorization code response bug

  - For public organizations access EntraID OIDC applications, the token endpoint returns `expires_in` value type in number.
  - For private organization access only applications, the token endpoint returns `expires_in` value type in string.
  - Expected `expires_in` value type is number. (See [v2-oauth2-auth-code-flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#successful-response-2) for reference)

  String type `expires_in` value is not supported by the current Microsoft EntraID OIDC connector, a invalid authorization response error will be thrown.
  Update the token response guard to handle both number and string type `expires_in` value. Make the SSO connector more robust.

- Updated dependencies [25d67f33f]
- Updated dependencies [e04d9523a]
- Updated dependencies [cb1a38c40]
- Updated dependencies [558986d28]
- Updated dependencies [b5104d8c1]
- Updated dependencies [0c70d65c7]
- Updated dependencies [a0b19513b]
- Updated dependencies [07ac3e87c]
- Updated dependencies [c558affac]
- Updated dependencies [76fd33b7e]
  - @logto/schemas@1.17.0
  - @logto/cli@1.17.0
  - @logto/console@1.15.0
  - @logto/phrases@1.11.0
  - @logto/experience@1.6.2
  - @logto/core-kit@2.5.0

## 1.16.0

### Minor Changes

- 8ef021fb3: add support for Redis Cluster and extra TLS options for Redis connections
- 21bb35b12: refactor the definition of hook event types

  - Add `DataHook` event types. `DataHook` are triggered by data changes.
  - Add "interaction" prefix to existing hook event types. Interaction hook events are triggered by end user interactions, e.g. completing sign-in.

- e8c41b164: support organization custom data

  Now you can save additional data associated with the organization with the organization-level `customData` field by:

  - Edit in the Console organization details page.
  - Specify `customData` field when using organization Management APIs.

- 5872172cb: enable custom JWT feature for OSS version

  OSS version users can now use custom JWT feature to add custom claims to JWT access tokens payload (previously, this feature was only available to Logto Cloud).

- 1ef32d6d5: update token grant to support organization API resources

  Organization roles can be assigned with scopes (permissions) from the API resources, and the token grant now supports this.

  Once the user is consent to an application with "resources" assigned, the token grant will now include the scopes inherited from all assigned organization roles.

  Users can narrow down the scopes by passing `organization_id` when granting an access token, and the token will only include the scopes from the organization roles of the specified organization, the access token will contain an extra claim `organization_id` to indicate the organization the token is granted for. Then the resource server can use this claim to protect the resource with additional organization-level authorization.

  This change is backward compatible, and the existing token grant will continue to work as before.

### Patch Changes

- 52df3ebbb: Bug fix: organization invitation APIs should handle invitee emails case insensitively
- 368385b93: Management API will not return 500 in production for status codes that are not listed in the OpenAPI spec
- d54530356: Fix OIDC AccessDenied error code to 403.

  This error may happen when you try to grant an access token to a user lacking the required permissions, especially when granting for orgnization related resources. The error code should be 403 instead of 400.

- 5b03030de: Not allow to modify management API resource through API.

  Previously, management API resource and its scopes are readonly in Console. But it was possible to modify through the API. This is not allowed anymore.

- 5660c54cb: Sign out user after deletion or suspension

  When a user is deleted or suspended through Management API, they should be signed out immediately, including sessions and refresh tokens.

- a9ccfc738: implement request ID for API requests

  - All requests will now include a request ID in the headers (`Logto-Core-Request-Id`)
  - Terminal logs will now include the request ID as the prefix

- bbd399e15: fix the new user from SSO register hook event not triggering bug

  ### Issue

  When a new user registers via SSO, the `PostRegister` interaction hook event is not triggered. `PostSignIn` event is mistakenly triggered instead.

  ### Root Cause

  In the SSO `post /api/interaction/sso/:connectionId/registration` API, we update the interaction event to `Register`.
  However, the hook middleware reads the event from interaction session ahead of the API logic, and the event is not updated resulting in the wrong event being triggered.

  In the current interaction API design, we should mutate the interaction event by calling the `PUT /api/interaction/event` API, instead of updating the event directly in the submit interaction APIs. (Just like the no direct mutation rule for a react state). So we can ensure the correct side effect like logs and hooks are triggered properly.

  All the other sign-in methods are using the `PUT /api/interaction/event` API to update the event. But when implementing the SSO registration API, we were trying to reduce the API requests and directly updated the event in the registration API which will submit the interaction directly.

  ### Solution

  Remove the event update logic in the SSO registration API and call the `PUT /api/interaction/event` API to update the event.
  This will ensure the correct event is triggered in the hook middleware.

  ### Action Items

  Align the current interaction API design for now.
  Need to improve the session/interaction API logic to simplify the whole process.

- b4b8015db: fix a bug that prevents invitee from accepting the organization invitation if the email letter case is not matching
- b575f57ac: Support comma separated resource parameter

  Some third-party libraries or plugins do not support array of resources, and can only specify `resource` through `additionalParameters` config, e.g. `flutter-appauth`. However, only one resource can be specified at a time in this way. This PR enables comma separated resource parameter support in Logto core service, so that multiple resources can be specified via a single string.

  For example: Auth URL like `/oidc/auth?resource=https://example.com/api1,https://example.com/api2` will be interpreted and parsed to Logto core service as `/ordc/auth?resource=https://example.com/api1&resource=https://example.com/api2`.

- aacbebcbc: Provide management API to fetch user organization scopes based on user organization roles

  - GET `organizations/:id/users/:userId/scopes`

- 3486b12e8: Fix file upload API.

  The `koa-body` has been upgraded to the latest version, which caused the file upload API to break. This change fixes the issue.

  The `ctx.request.files.file` in the new version is an array, so the code has been updated to pick the first one.

- ead2abde6: fix a bug that API resource indicator does not work if the indicator is not followed by a trailing slash or a pathname

  - Bump `oidc-provider@8.4.6` to fix the above issue

- Updated dependencies [21bb35b12]
- Updated dependencies [5b03030de]
- Updated dependencies [b80934ac5]
- Updated dependencies [a9ccfc738]
- Updated dependencies [e8c41b164]
- Updated dependencies [5872172cb]
- Updated dependencies [6fe6f87bc]
- Updated dependencies [21bb35b12]
- Updated dependencies [bbd399e15]
- Updated dependencies [3486b12e8]
- Updated dependencies [9cf03c8ed]
- Updated dependencies [c1c746bca]
  - @logto/schemas@1.16.0
  - @logto/console@1.14.0
  - @logto/phrases@1.10.1
  - @logto/experience@1.6.1
  - @logto/app-insights@2.0.0
  - @logto/shared@3.1.1
  - @logto/cli@1.16.0

## 1.15.0

### Minor Changes

- 172411946: Add avatar and customData fields to create user API (POST /api/users)
- abffb9f95: full oidc standard claims support

  We have added support for the remaining [OpenID Connect standard claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims). Now, these claims are accessible in both ID tokens and the response from the `/me` endpoint.

  Additionally, we adhere to the standard scopes - claims mapping. This means that you can retrieve most of the profile claims using the `profile` scope, and the `address` claim can be obtained by using the `address` scope.

  For all newly introduced claims, we store them in the `user.profile` field.

  > ![Note]
  > Unlike other database fields (e.g. `name`), the claims stored in the `profile` field will fall back to `undefined` rather than `null`. We refrain from using `?? null` here to reduce the size of ID tokens, since `undefined` fields will be stripped in tokens.

- 2cbc591ff: support `first_screen` parameter in authentication request

  Sign-in experience can be initiated with a specific screen by setting the `first_screen` parameter in the OIDC authentication request. This parameter is intended to replace the `interaction_mode` parameter, which is now deprecated.

  The `first_screen` parameter can have the following values:

  - `signIn`: The sign-in screen is displayed first.
  - `register`: The registration screen is displayed first.

  Here's a non-normative example of how to use the `first_screen` parameter:

  ```
  GET /authorize?
    response_type=code
    &client_id=your_client_id
    &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
    &scope=openid
    &state=af0ifjsldkj
    &nonce=n-0S6_WzA2Mj
    &first_screen=signIn
  ```

  When `first_screen` is set, the legacy `interaction_mode` parameter is ignored.

- 468558721: Get organization roles with search keyword.
- cc01acbd0: Create a new user through API with password digest and corresponding algorithm
- 2cbc591ff: support direct sign-in

  Instead of showing a screen for the user to choose between the sign-in methods, a specific sign-in method can be initiated directly by setting the `direct_sign_in` parameter in the OIDC authentication request.

  This parameter follows the format of `direct_sign_in=<method>:<target>`, where:

  - `<method>` is the sign-in method to trigger. Currently the only supported value is `social`.
  - `<target>` is the target value for the sign-in method. If the method is `social`, the value is the social connector's `target`.

  When a valid `direct_sign_in` parameter is set, the first screen will be skipped and the specified sign-in method will be triggered immediately upon entering the sign-in experience. If the parameter is invalid, the default behavior of showing the first screen will be used.

### Patch Changes

- 7c22c50cb: Fix SSO connector new user authentication internal server error.

  ## Description

  Thanks to the [issue](https://github.com/logto-io/logto/issues/5502) report, we found that the SSO connector new user authentication was causing an internal server error. Should return an 422 status code instead of 500. Frontend sign-in page can not handle the 500 error and complete the new user registration process.

  ### Root cause

  When the SSO connector returns a new user that does not exist in the Logto database, the backend with throw a 422 error. Frontend relies the 422 error to redirect and complete the new user registration process.

  However, the backend was throwing a 500 error instead. That is because we applied a strict API response status code guard at the koaGuard middleware level. The status code 422 was not listed. Therefore, the middleware threw a 500 error.

  ### Solution

  We added the 422 status code to the koaGuard middleware. Now, the backend will return a 422 status code when the SSO connector returns a new user that does not exist in the Logto database. The frontend sign-in page can handle the 422 error and complete the new user registration process.

- Updated dependencies [5758f84f5]
- Updated dependencies [57d97a4df]
- Updated dependencies [7756f50f8]
- Updated dependencies [abffb9f95]
- Updated dependencies [746483c49]
- Updated dependencies [2cbc591ff]
- Updated dependencies [57d97a4df]
- Updated dependencies [cc01acbd0]
- Updated dependencies [2cbc591ff]
- Updated dependencies [951865859]
- Updated dependencies [5a7204571]
- Updated dependencies [2cbc591ff]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/console@1.13.0
  - @logto/phrases@1.10.0
  - @logto/connector-kit@3.0.0
  - @logto/experience@1.6.0
  - @logto/core-kit@2.4.0
  - @logto/schemas@1.15.0
  - @logto/phrases-experience@1.6.1
  - @logto/demo-app@1.2.0
  - @logto/cli@1.15.0
  - @logto/shared@3.1.0

## 1.14.0

### Minor Changes

- 532454b92: support form post callback for social connectors

  Add the `POST /callback/:connectorId` endpoint to handle the form post callback for social connectors. This usefull for the connectors that require a form post callback to complete the authentication process, such as Apple.

### Patch Changes

- @logto/schemas@1.14.0
- @logto/cli@1.14.0

## 1.13.1

### Patch Changes

- Updated dependencies [677054a24]
  - @logto/console@1.12.1
  - @logto/schemas@1.13.1
  - @logto/cli@1.13.1

## 1.13.0

### Minor Changes

- 32df9acde: implement Logto core API to support the new third-party application feature, and user consent interaction flow

  ### Management API

  - Add new endpoint `/applications/sign-in-experiences` with `PUT`, `GET` methods to manage the application level sign-in experiences.
  - Add new endpoint `/applications/:id/users/:userId/consent-organizations` with `PUT`, `GET`, `POST`, `DELETE` methods to manage the user granted organizations for the third-party application.
  - Add new endpoint `/applications/:id/user-consent-scopes` with `GET`, `POST`, `DELETE` methods to manage the user consent resource, organization, and user scopes for the third-party application.
  - Update the `/applications` endpoint to include the new `is_third_party` field. Support create third-party applications, and query by `is_third_party` field.

  ### Interaction API

  - Add the `koaAutoConsent` to support the auto-consent interaction flow for the first-party application. If is the first-party application we can auto-consent the requested scopes. If is the third-party application we need to redirect the user to the consent page to get the user consent manually.
  - Add the `GET /interaction/consent` endpoint to support fetching the consent context for the user consent page. Including the application detail, authenticated user info, all the requested scopes and user organizations info (if requested scopes include the organization scope).
  - Update the `POST /interaction/consent` endpoint to support the user consent interaction flow. Including grant all the missing scopes, and update the user granted organizations for the third-party application.

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9222eb9f8: Set `on conflict do nothing` for all the `RelationQueries` insert operation.

  - For all the relation table entities, we want to safely insert them into the database. If the relation entity already exists, instead of throwing an error, we ignore the insert operation, especially on a batch insert. Unlike other resource data entities, user does not care if the relation entity already exists. Therefore, we want to silently ignore the insert operation if the relation entity already exists.

- acb7fd3fe: Add case sensitive username env variable
- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [a2ce0be46]
- Updated dependencies [e4c73e7bb]
- Updated dependencies [acb7fd3fe]
- Updated dependencies [32df9acde]
- Updated dependencies [9089dbf84]
- Updated dependencies [c14cd1827]
- Updated dependencies [b40bae9c5]
- Updated dependencies [32df9acde]
- Updated dependencies [04ec78a91]
- Updated dependencies [32df9acde]
- Updated dependencies [715dba2ce]
- Updated dependencies [31e60811d]
- Updated dependencies [8c4bfbce1]
- Updated dependencies [32df9acde]
- Updated dependencies [570a4ea9e]
- Updated dependencies [570a4ea9e]
- Updated dependencies [6befe6014]
  - @logto/schemas@1.13.0
  - @logto/cli@1.13.0
  - @logto/shared@3.1.0
  - @logto/experience@1.5.0
  - @logto/connector-kit@2.1.0
  - @logto/language-kit@1.1.0
  - @logto/phrases-experience@1.6.0
  - @logto/core-kit@2.3.0
  - @logto/app-insights@1.4.0
  - @logto/demo-app@1.1.0
  - @logto/console@1.12.0
  - @logto/phrases@1.9.0

## 1.12.0

### Minor Changes

- 9a7b19e49: Support single sign-on (SSO) on Logto.

  - Implement new SSO connector management APIs.

    - `GET /api/sso-connector-providers` - List all the supported SSO connector providers.
    - `POST /api/sso-connectors` - Create new SSO connector.
    - `GET /api/sso-connectors` - List all the SSO connectors.
    - `GET /api/sso-connectors/:id` - Get SSO connector by id.
    - `PATCH /api/sso-connectors/:id` - Update SSO connector by id.
    - `DELETE /api/sso-connectors/:id` - Delete SSO connector by id.

  - Implement new SSO interaction APIs to enable the SSO connector sign-in methods

    - `POST /api/interaction/single-sign-on/:connectorId/authorization-url` - Init a new SSO connector sign-in interaction flow by retrieving the IdP's authorization URL.
    - `POST /api/interaction/single-sign-on/:connectorId/authentication` - Handle the SSO connector sign-in interaction flow by retrieving the IdP's authentication data.
    - `POST /api/interaction/single-sign-on/:connectorId/registration` - Create new user account by using the SSO IdP's authentication result.
    - `GET /api/interaction/single-sign-on/connectors` - List all the enabled SSO connectors by a given email address.

  - Implement new SSO connector factory to support different SSO connector providers.
    - `OIDC` - Standard OIDC connector that can be used to connect with any OIDC compatible IdP.
    - `SAML` - Standard SAML 2.0 connector that can be used to connect with any SAML 2.0 compatible IdP.
    - `AzureAD` - Azure Active Directory connector that can be used to connect with Azure AD.
    - `Okta` - Okta connector that can be used to connect with Okta.
    - `Google Workspace` - Google Workspace connector that can be used to connect with Google Workspace.

- becf59169: introduce Logto Organizations

  The term "organization" is also used in other forms, such as "workspace", "team", "company", etc. In Logto, we use "organization" as the generic term to represent the concept of multi-tenancy.

  From now, you can create multiple organizations in Logto, each of which can have its own users, while in the same identity pool.

  Plus, we also introduce the concept of "organization template". It is a set of permissions and roles that applies to all organizations, while a user can have different roles in different organizations.

  See [🏢 Organizations (Multi-tenancy)](https://docs.logto.io/docs/recipes/organizations/) for more details.

### Patch Changes

- b05fb2960: add summary and description to APIs
- 9a4da065d: fix incorrect swagger components
- b4f702a86: userinfo endpoint will return `organization_data` claim if organization scope is requested

  The claim includes all organizations that the user is a member of with the following structure:

  ```json
  {
    "organization_data": [
      {
        "id": "organization_id",
        "name": "organization_name",
        "description": "organization_description"
      }
    ]
  }
  ```

- 3e92a2032: refactor: add user ip to webhook event payload
- Updated dependencies [9a7b19e49]
- Updated dependencies [9a7b19e49]
- Updated dependencies [4b90782ae]
- Updated dependencies [9a7b19e49]
- Updated dependencies [9421375d7]
- Updated dependencies [becf59169]
- Updated dependencies [b4f702a86]
- Updated dependencies [3e92a2032]
- Updated dependencies [9a7b19e49]
- Updated dependencies [9a7b19e49]
  - @logto/experience@1.4.0
  - @logto/phrases@1.8.0
  - @logto/cli@1.12.0
  - @logto/console@1.11.0
  - @logto/core-kit@2.2.1
  - @logto/schemas@1.12.0
  - @logto/phrases-experience@1.5.0

## 1.11.0

### Minor Changes

- 6727f629d: feature: introduce multi-factor authentication

  We're excited to announce that Logto now supports multi-factor authentication (MFA) for your sign-in experience. Navigate to the "Multi-factor auth" tab to configure how you want to secure your users' accounts.

  In this release, we introduce the following MFA methods:

  - Authenticator app OTP: users can add any authenticator app that supports the TOTP standard, such as Google Authenticator, Duo, etc.
  - WebAuthn (Passkey): users can use the standard WebAuthn protocol to register a hardware security key, such as biometric keys, Yubikey, etc.
  - Backup codes：users can generate a set of backup codes to use when they don't have access to other MFA methods.

  For a smooth transition, we also support to configure the MFA policy to require MFA for sign-in experience, or to allow users to opt-in to MFA.

### Patch Changes

- bbe7f0b8e: refactored swagger json api

  - reuse parameter definitions, which reduces the size of the swagger response.
  - tags are now in sentence case.
  - path parameters now follow the swagger convention, using `{foo}` instead of `:foo`.

- Updated dependencies [6727f629d]
  - @logto/console@1.10.0
  - @logto/experience@1.3.0
  - @logto/phrases@1.7.0
  - @logto/phrases-experience@1.4.0
  - @logto/schemas@1.11.0
  - @logto/cli@1.11.0

## 1.10.1

### Patch Changes

- 46d0d4c0b: convert private signing key type from string to JSON object, in order to provide additional information such as key ID and creation timestamp.
- 1ab39d19b: fix 500 error when using search component in console to filter both roles and applications.
- Updated dependencies [46d0d4c0b]
- Updated dependencies [1ab39d19b]
- Updated dependencies [87df417d1]
- Updated dependencies [d24aaedf5]
  - @logto/schemas@1.10.1
  - @logto/cli@1.10.1
  - @logto/console@1.9.0
  - @logto/phrases@1.6.0
  - @logto/connector-kit@2.0.0
  - @logto/experience@1.2.1
  - @logto/shared@3.0.0

## 1.10.0

### Minor Changes

- 03bc7888b: machine-to-machine (M2M) role-based access control (RBAC)

  ### Summary

  This feature enables Logto users to apply role-based access control (RBAC) to their machine-to-machine (M2M) applications.

  With the update, Logto users can now effectively manage permissions for their M2M applications, resulting in improved security and flexibility.

  Following new APIs are added for M2M role management:

  **Applications**

  - `POST /applications/:appId/roles` assigns role(s) to the M2M application
  - `DELETE /applications/:appId/roles/:roleId` deletes the role from the M2M application
  - `GET /applications/:appId/roles` lists all roles assigned to the M2M application

  **Roles**

  - `POST /roles/:roleId/applications` assigns the role to multiple M2M applications
  - `DELETE /roles/:roleId/applications/:appId` removes the M2M application assigned to the role
  - `GET /roles/:roleId/applications` lists all M2M applications granted with the role

  Updated following API:

  **Roles**

  - `POST /roles` to specify the role type (either `user` or `machine-to-machine` role)

  **Users**

  - `POST /users/:userId/roles` to prevent assigning M2M roles to end-users

- 2c340d379: support `roles` scope for ID token to issue `roles` claim

### Patch Changes

- Updated dependencies [2c340d379]
  - @logto/core-kit@2.2.0
  - @logto/schemas@1.10.0
  - @logto/cli@1.10.0

## 1.9.2

### Patch Changes

- 18181f892: standardize id and secret generators

  - Remove `buildIdGenerator` export from `@logto/shared`
  - Add `generateStandardSecret` and `generateStandardShortId` exports to `@logto/shared`
  - Align comment and implementation of `buildIdGenerator` in `@logto/shared`
    - The comment stated the function will include uppercase letters by default, but it did not; Now it does.
  - Use `generateStandardSecret` for all secret generation

- 827123faa: block an identifier from verification for 10 minutes after 5 failed attempts within 1 hour
- Updated dependencies [a8b5a020f]
- Updated dependencies [18181f892]
  - @logto/console@1.8.0
  - @logto/shared@3.0.0
  - @logto/schemas@1.9.2
  - @logto/cli@1.9.2
  - @logto/core-kit@2.1.2

## 1.9.1

### Patch Changes

- Updated dependencies [a4b44dde5]
- Updated dependencies [6f5a0acad]
  - @logto/console@1.7.1
  - @logto/phrases-experience@1.3.1
  - @logto/core-kit@2.1.1
  - @logto/experience@1.2.1
  - @logto/schemas@1.9.1
  - @logto/cli@1.9.1

## 1.9.0

### Minor Changes

- e8b0b1d02: feature: password policy

  ### Summary

  This feature enables custom password policy for users. Now it is possible to guard with the following rules when a user is creating a new password:

  - Minimum length (default: `8`)
  - Minimum character types (default: `1`)
  - If the password has been pwned (default: `true`)
  - If the password is exactly the same as or made up of the restricted phrases:
    - Repetitive or sequential characters (default: `true`)
    - User information (default: `true`)
    - Custom words (default: `[]`)

  If you are an existing Logto Cloud user or upgrading from a previous version, to ensure a smooth experience, we'll keep the original policy as much as possible:

  > The original password policy requires a minimum length of 8 and at least 2 character types (letters, numbers, and symbols).

  Note in the new policy implementation, it is not possible to combine lower and upper case letters into one character type. So the original password policy will be translated into the following:

  - Minimum length: `8`
  - Minimum character types: `2`
  - Pwned: `false`
  - Repetitive or sequential characters: `false`
  - User information: `false`
  - Custom words: `[]`

  If you want to change the policy, you can do it:

  - Logto Console -> Sign-in experience -> Password policy.
  - Update `passwordPolicy` property in the sign-in experience via Management API.

  ### Side effects

  - All new users will be affected by the new policy immediately.
  - Existing users will not be affected by the new policy until they change their password.
  - We removed password restrictions when adding or updating a user via Management API.

- 17fd64e64: Support region option for s3 storage

### Patch Changes

- f8408fa77: rename the package `phrases-ui` to `phrases-experience`
- f6723d5e2: rename the package `ui` to `experience`
- Updated dependencies [e8b0b1d02]
- Updated dependencies [daf9674b6]
- Updated dependencies [f8408fa77]
- Updated dependencies [17fd64e64]
- Updated dependencies [18e05586c]
- Updated dependencies [f6723d5e2]
- Updated dependencies [310698b0d]
- Updated dependencies [5d78c7271]
  - @logto/schemas@1.9.0
  - @logto/console@1.7.0
  - @logto/phrases@1.5.0
  - @logto/phrases-experience@1.3.0
  - @logto/core-kit@2.1.0
  - @logto/experience@1.2.0
  - @logto/cli@1.9.0
  - @logto/shared@2.0.1

## 1.8.0

### Patch Changes

- 0b519e548: allow non-http origins for application CORS
- Updated dependencies [0b519e548]
- Updated dependencies [d90b4e7f6]
- Updated dependencies [ae0ef919f]
  - @logto/console@1.6.0
  - @logto/schemas@1.8.0
  - @logto/cli@1.8.0

## 1.7.0

### Minor Changes

- 5ccdd7f31: Record daily active users

### Patch Changes

- Updated dependencies [16d83dd2f]
- Updated dependencies [5ccdd7f31]
- Updated dependencies [fde330a8b]
  - @logto/console@1.5.1
  - @logto/schemas@1.7.0
  - @logto/cli@1.7.0

## 1.6.0

### Minor Changes

- ecbecd8e4: various application improvements

  - Show OpenID Provider configuration endpoint in Console
  - Configure "Rotate Refresh Token" in Console
  - Configure "Refresh Token TTL" in Console

### Patch Changes

- Updated dependencies [ecbecd8e4]
- Updated dependencies [e9c2c9a6d]
- Updated dependencies [c743cef42]
- Updated dependencies [ecbecd8e4]
- Updated dependencies [cfe4fce51]
  - @logto/cli@1.6.0
  - @logto/core-kit@2.0.1
  - @logto/ui@1.1.5
  - @logto/console@1.5.0
  - @logto/schemas@1.6.0
  - @logto/phrases@1.4.1
  - @logto/app-insights@1.3.1

## 1.5.0

### Minor Changes

- 73666f8fa: Provide new features for webhooks

  ## Features

  - Manage webhooks via the Admin Console
  - Securing webhooks by validating signature
  - Allow to enable/disable a webhook
  - Track recent execution status of a webhook
  - Support multi-events for a webhook

  ## Updates

  - schemas: add `name`, `events`, `signingKey`, and `enabled` fields to the `hook` schema
  - core: change the `user-agent` value from `Logto (https://logto.io)` to `Logto (https://logto.io/)` in the webhook request headers
  - core: deprecate `event` field in all hook-related APIs, use `events` instead
  - core: deprecate `retries` field in the `HookConfig` for all hook-related APIs, now it will fallback to `3` if not specified and will be removed in the future
  - core: add new APIs for webhook management
    - `GET /api/hooks/:id/recent-logs` to retrieve recent execution logs(24h) of a webhook
    - `POST /api/hooks/:id/test` to test a webhook
    - `PATCH /api/hooks/:id/signing-key` to regenerate the signing key of a webhook
  - core: support query webhook execution stats(24h) via `GET /api/hooks/:id` and `GET /api/hooks/:id` by specifying `includeExecutionStats` query parameter
  - console: support webhook management

- 268dc50e7: Support setting default API Resource from Console and API

  - New API Resources will not be treated as default.
  - Added `PATCH /resources/:id/is-default` to setting `isDefault` for an API Resource.
    - Only one default API Resource is allowed per tenant. Setting one API default will reset all others.

- fa0dbafe8: Add custom domain support

### Patch Changes

- ac65c8de4: ### Enable strict CSP policy check header

  This change removes the report only flag from CSP security header settings, which will enables the strict CSP policy check for all requests.

- 3d9885233: ## Bump oidc-provider version

  Bump oidc-provider version to [v8.2.2](https://github.com/panva/node-oidc-provider/releases/tag/v8.2.2). This version fixes a bug that prevented the revoked scopes from being removed from the access token.

  > Issued Access Tokens always only contain scopes that are defined on the respective Resource Server (returned from features.resourceIndicators.getResourceServerInfo).

  If the scopes are revoked from the resource server, they should be removed from the newly granted access token. This is now fixed in the new version of oidc-provider.

- 813e21639: Bug fix: reset password webhook should be triggered when the user resets password
- Updated dependencies [2cab3787c]
- Updated dependencies [73666f8fa]
- Updated dependencies [268dc50e7]
- Updated dependencies [fa0dbafe8]
- Updated dependencies [497d5b526]
  - @logto/schemas@1.5.0
  - @logto/console@1.4.0
  - @logto/phrases@1.4.0
  - @logto/cli@1.5.0

## 1.4.0

### Minor Changes

- 9a3aa3aae: Automatically sync the trusted social email and phone info to the new registered user profile
- 5d6720805: add config `alwaysIssueRefreshToken` for web apps to unblock OAuth integrations that are not strictly conform OpenID Connect.

  when it's enabled, Refresh Tokens will be always issued regardless if `prompt=consent` was present in the authorization request.

### Patch Changes

- 5d6720805: parse requests with `application/json` content-type for `/oidc` APIs to increase compatibility
- Updated dependencies [5d6720805]
- Updated dependencies [5d6720805]
  - @logto/cli@1.4.0
  - @logto/console@1.3.0
  - @logto/phrases@1.3.0
  - @logto/schemas@1.4.0

## 1.3.1

### Patch Changes

- 5a59cd38e: Disable pkce requirement for traditional web app
  - @logto/schemas@1.3.1
  - @logto/cli@1.3.1

## 1.3.0

### Minor Changes

- 0023dfe38: Provide management APIs to help link social identities to user

  - POST `/users/:userId/identities` to link a social identity to a user
  - POST `/connectors/:connectorId/authorization-uri` to get the authorization URI for a connector

### Patch Changes

- 1642df7e1: add response schemas to swagger.json API
- Updated dependencies [a65bc9b13]
- Updated dependencies [beb6ebad5]
  - @logto/console@1.2.4
  - @logto/schemas@1.3.0
  - @logto/cli@1.3.0

## 1.2.3

### Patch Changes

- 046a5771b: upgrade i18next series packages (#3733, #3743)
- Updated dependencies [046a5771b]
  - @logto/console@1.2.3
  - @logto/demo-app@1.0.1
  - @logto/ui@1.1.4
  - @logto/schemas@1.2.3
  - @logto/cli@1.2.3

## 1.2.2

### Patch Changes

- Updated dependencies [4331deb6f]
- Updated dependencies [748878ce5]
  - @logto/app-insights@1.2.0
  - @logto/console@1.2.2
  - @logto/ui@1.1.3
  - @logto/schemas@1.2.2
  - @logto/cli@1.2.2

## 1.2.1

### Patch Changes

- Updated dependencies [352807b16]
  - @logto/app-insights@1.1.0
  - @logto/console@1.2.1
  - @logto/ui@1.1.2
  - @logto/schemas@1.2.1
  - @logto/cli@1.2.1

## 1.2.0

### Minor Changes

- 1548e0732: implement a central cache store to cache well-known with Redis implementation

### Patch Changes

- 7af8e9c9b: Add new management API `/users/:userId/password/verify` to help verify user password, which would be helpful when building custom profile or sign-in pages
- 6b1948592: Provide management API to detect if a user has set the password.
- 4945b0be2: Apply security headers

  Apply security headers to logto http request response using (helmetjs)[https://helmetjs.github.io/].

  - [x] crossOriginOpenerPolicy
  - [x] crossOriginEmbedderPolicy
  - [x] crossOriginResourcePolicy
  - [x] hidePoweredBy
  - [x] hsts
  - [x] ieNoOpen
  - [x] noSniff
  - [x] referrerPolicy
  - [x] xssFilter
  - [x] Content-Security-Policy

- Updated dependencies [6cbc90389]
- Updated dependencies [3c84d81ff]
- Updated dependencies [ae6a54993]
- Updated dependencies [206fba2b5]
- Updated dependencies [457cb2822]
- Updated dependencies [736d6d212]
- Updated dependencies [4945b0be2]
- Updated dependencies [c5eb3a2ba]
- Updated dependencies [5553425fc]
- Updated dependencies [30033421c]
- Updated dependencies [91906f0eb]
  - @logto/console@1.2.0
  - @logto/cli@1.2.0
  - @logto/phrases@1.2.0
  - @logto/phrases-ui@1.2.0
  - @logto/schemas@1.2.0
  - @logto/shared@2.0.0
  - @logto/ui@1.1.1
  - @logto/core-kit@2.0.0
  - @logto/connector-kit@1.1.1
  - @logto/demo-app@1.0.0

## 1.1.0

### Patch Changes

- Updated dependencies [f9ca7cc49]
- Updated dependencies [37714d153]
- Updated dependencies [f3d60a516]
- Updated dependencies [5c50957a9]
- Updated dependencies [e9e8a6e11]
- Updated dependencies [e2ec1f93e]
  - @logto/phrases@1.1.0
  - @logto/phrases-ui@1.1.0
  - @logto/cli@1.1.0
  - @logto/schemas@1.1.0
  - @logto/shared@1.0.3

## 1.0.3

### Patch Changes

- Updated dependencies [5b4da1e3d]
  - @logto/schemas@1.0.7
  - @logto/cli@1.0.3
  - @logto/shared@1.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [621b09ba1]
  - @logto/schemas@1.0.1
  - @logto/cli@1.0.2
  - @logto/shared@1.0.1

## 1.0.1

### Patch Changes

- 03ac35e75: fix applications_roles query
  - @logto/cli@1.0.1

## 1.0.0

### Major Changes

- c12717412: **Decouple users and admins**

  ## 💥 BREAKING CHANGES 💥

  Logto was using a single port to serve both normal users and admins, as well as the web console. While we continuously maintain a high level of security, it’ll still be great to decouple these components into two separate parts to keep data isolated and provide a flexible infrastructure.

  From this version, Logto now listens to two ports by default, one for normal users (`3001`), and one for admins (`3002`).

  - Nothing changed for normal users. No adaption is needed.
  - For admin users:
    - The default Admin Console URL has been changed to `http://localhost:3002/console`.
    - To change the admin port, set the environment variable `ADMIN_PORT`. For instance, `ADMIN_PORT=3456`.
    - You can specify a custom endpoint for admins by setting the environment variable `ADMIN_ENDPOINT`. For example, `ADMIN_ENDPOINT=https://admin.your-domain.com`.
    - You can now completely disable admin endpoints by setting `ADMIN_DISABLE_LOCALHOST=1` and leaving `ADMIN_ENDPOINT` unset.
    - Admin Console and admin user data are not accessible via normal user endpoints, including `localhost` and `ENDPOINT` from the environment.
    - Admin Console no longer displays audit logs of admin users. However, these logs still exist in the database, and Logto still inserts admin user logs. There is just no convenient interface to inspect them.
    - Due to the data isolation, the numbers on the dashboard may slightly decrease (admins are excluded).

  If you are upgrading from a previous version, simply run the database alteration command as usual, and we'll take care of the rest.

  > **Note** DID YOU KNOW
  >
  > Under the hood, we use the powerful Postgres feature Row-Level Security to isolate admin and user data.

- 1c9160112: Packages are now ESM.
- 343b1090f: **💥 BREAKING CHANGE 💥** Move `/api/phrase` API to `/api/.well-known/phrases`
- f41fd3f05: drop settings table and add systems table

  **BREAKING CHANGES**

  - core: removed `GET /settings` and `PATCH /settings` API
  - core: added `GET /configs/admin-console` and `PATCH /configs/admin-console` API
    - `/configs/*` APIs are config/key-specific now. they may have different logic per key
  - cli: change valid `logto db config` keys by removing `alterationState` and adding `adminConsole` since:
    - OIDC configs and admin console configs are tenant-level configs (the concept of "tenant" can be ignored until we officially announce it)
    - alteration state is still a system-wide config

### Minor Changes

- c12717412: - mask sensitive password value in audit logs
- f41fd3f05: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- c12717412: ## Creating your social connector with ease

  We’re excited to announce that Logto now supports standard protocols (SAML, OIDC, and OAuth2.0) for creating social connectors to integrate external identity providers. Each protocol can create multiple social connectors, giving you more control over your access needs.

  To simplify the process of configuring social connectors, we’re replacing code-edit with simple forms. SAML already supports form configuration, with other connectors coming soon. This means you don’t need to compare documents or worry about code format.

- c12717412: ## Enable connector method `getUserInfo` read and write access to DB

  Logto connectors are designed to be stateless to the extent possible and practical, but it still has some exceptions at times.

  With the recent addition of database read and write access, connectors can now store persistent information. For example, connectors can now store access tokens and refresh tokens to minimize number of requests to social vendor's APIs.

- 343b1090f: - Automatically create a new tenant for new cloud users
  - Support path-based multi-tenancy
- 343b1090f: Add storage provider: S3Storage
- 343b1090f: Allow admin tenant admin to create tenants without limitation
- 343b1090f: ### Add privacy policy url

  In addition to the terms of service url, we also provide a privacy policy url field in the sign-in-experience settings. To better support the end-users' privacy declaration needs.

- 18e3b82e6: Add user suspend API endpoint

  Use `PATCH /api/users/:userId/is-suspended` to update a user's suspended state, once a user is suspended, all refresh tokens belong to this user will be revoked.

  Suspended users will get an error toast when trying to sign in.

- 343b1090f: Add API for uploading user images to storage providers: Azure Storage.
- f41fd3f05: Officially cleanup all deprecated `/session` APIs in core and all the related integration tests.
- 343b1090f: **Add `sessionNotFoundRedirectUrl` tenant config**

  - User can use this optional config to designate the URL to redirect if session not found in Sign-in Experience.
  - Session guard now works for root path as well.

- 343b1090f: New feature: User account settings page

  - We have removed the previous settings page and moved it to the account settings page. You can access to the new settings menu by clicking the user avatar in the top right corner.
  - You can directly change the language or theme from the popover menu, and explore more account settings by clicking the "Profile" menu item.
  - You can update your avatar, name and username in the profile page, and also changing your password.
  - [Cloud] Cloud users can also link their email address and social accounts (Google and GitHub at first launch).

- 343b1090f: remove the branding style config and make the logo URL config optional
- c12717412: **Customize CSS for Sign-in Experience**

  We have put a lot of effort into improving the user sign-in experience and have provided a brand color option for the UI. However, we know that fine-tuning UI requirements can be unpredictable. While Logto is still exploring the best options for customization, we want to provide a programmatic method to unblock your development.

  You can now use the Management API `PATCH /api/sign-in-exp` with body `{ "customCss": "arbitrary string" }` to set customized CSS for the sign-in experience. You should see the value of `customCss` attached after `<title>` of the page. If the style has a higher priority, it should be able to override.

  > **Note**
  >
  > Since Logto uses CSS Modules, you may see a hash value in the `class` property of DOM elements (e.g. a `<div>` with `vUugRG_container`). To override these, you can use the `$=` CSS selector to match elements that end with a specified value. In this case, it should be `div[class$=container]`.

- 2168936b9: **Sign-in Experience v2**

  We are thrilled to announce the release of the newest version of the Sign-in Experience, which includes more ways to sign-in and sign-up, as well as a framework that is easier to understand and more flexible to configure in the Admin Console.

  When compared to Sign-in Experience v1, this version’s capability was expanded so that it could support a greater variety of flexible use cases. For example, now users can sign up with email verification code and sign in with email and password.

  We hope that this will be able to assist developers in delivering a successful sign-in flow, which will also be appreciated by the end users.

- 1c9160112: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

- f41fd3f05: - cli: use `ec` with `secp384r1` as the default key generation type
  - core: use `ES384` as the signing algorithm for EC keys
- 343b1090f: ### Add custom content sign-in-experience settings to allow insert custom static html content to the logto sign-in pages

  - feat: combine with the custom css, give the user the ability to further customize the sign-in pages

- fdb2bb48e: **Streamlining the social sign-up flow**

  - detect trusted email (or phone number) from the social account
    - email (or phone number) has been registered: automatically connecting the social identity to the existing user account with a single click
    - email (or phone number) not registered: automatically sync up the user profile with the social provided email (or phone) if and only if marked as a required user profile.

- f41fd3f05: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.
- 402866994: **💥 Breaking change 💥**

  Use case-insensitive strategy for searching emails

- f41fd3f05: Add support to send and verify verification code in management APIs

### Patch Changes

- e63f5f8b0: Bump connector kit version to fix "Continue" issues on sending email/sms.
- 51f527b0c: bug fixes

  - core: fix 500 error when enabling app admin access in console
  - ui: handle required profile errors on social binding flow

- 343b1090f: ## Refactor the Admin Console 403 flow

  - Add 403 error handler for all AC API requests
  - Show confirm modal to notify the user who is not authorized
  - Click `confirm` button to sign out and redirect user to the sign-in page

- 343b1090f: Add interactionMode extra OIDC params to specify the desired use interaction experience

  - signUp: Deliver a sign-up first interaction experience
  - signIn & undefined: Deliver a default sign-in first interaction experience

- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.
- 343b1090f: **Seed data for cloud**

  - cli!: remove `oidc` option for `database seed` command as it's unused
  - cli: add hidden `--cloud` option for `database seed` command to init cloud data
  - cli, cloud: appending Redirect URIs to Admin Console will deduplicate values before update
  - move `UrlSet` and `GlobalValues` to `@logto/shared`

- 5e1466f40: Allow localhost CORS when only one endpoint available
- Updated dependencies [343b1090f]
- Updated dependencies [f41fd3f05]
- Updated dependencies [e63f5f8b0]
- Updated dependencies [f41fd3f05]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [68f2d56a2]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [38970fb88]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [1c9160112]
- Updated dependencies [343b1090f]
- Updated dependencies [1c9160112]
- Updated dependencies [f41fd3f05]
- Updated dependencies [7fb689b73]
- Updated dependencies [1c9160112]
- Updated dependencies [343b1090f]
- Updated dependencies [f41fd3f05]
- Updated dependencies [f41fd3f05]
- Updated dependencies [2d45cc3e6]
- Updated dependencies [3ff2e90cd]
  - @logto/schemas@1.0.0
  - @logto/shared@1.0.0
  - @logto/cli@1.0.0
  - @logto/phrases-ui@1.0.0
  - @logto/phrases@1.0.0
  - @logto/connector-kit@1.1.0
  - @logto/core-kit@1.1.0

## 1.0.0-rc.3

### Patch Changes

- 5e1466f40: Allow localhost CORS when only one endpoint available
  - @logto/cli@1.0.0-rc.3

## 1.0.0-rc.2

### Major Changes

- c12717412: **Decouple users and admins**

  ## 💥 BREAKING CHANGES 💥

  Logto was using a single port to serve both normal users and admins, as well as the web console. While we continuously maintain a high level of security, it’ll still be great to decouple these components into two separate parts to keep data isolated and provide a flexible infrastructure.

  From this version, Logto now listens to two ports by default, one for normal users (`3001`), and one for admins (`3002`).

  - Nothing changed for normal users. No adaption is needed.
  - For admin users:
    - The default Admin Console URL has been changed to `http://localhost:3002/console`.
    - To change the admin port, set the environment variable `ADMIN_PORT`. For instance, `ADMIN_PORT=3456`.
    - You can specify a custom endpoint for admins by setting the environment variable `ADMIN_ENDPOINT`. For example, `ADMIN_ENDPOINT=https://admin.your-domain.com`.
    - You can now completely disable admin endpoints by setting `ADMIN_DISABLE_LOCALHOST=1` and leaving `ADMIN_ENDPOINT` unset.
    - Admin Console and admin user data are not accessible via normal user endpoints, including `localhost` and `ENDPOINT` from the environment.
    - Admin Console no longer displays audit logs of admin users. However, these logs still exist in the database, and Logto still inserts admin user logs. There is just no convenient interface to inspect them.
    - Due to the data isolation, the numbers on the dashboard may slightly decrease (admins are excluded).

  If you are upgrading from a previous version, simply run the database alteration command as usual, and we'll take care of the rest.

  > **Note** DID YOU KNOW
  >
  > Under the hood, we use the powerful Postgres feature Row-Level Security to isolate admin and user data.

### Minor Changes

- c12717412: - mask sensitive password value in audit logs
- c12717412: ## Creating your social connector with ease

  We’re excited to announce that Logto now supports standard protocols (SAML, OIDC, and OAuth2.0) for creating social connectors to integrate external identity providers. Each protocol can create multiple social connectors, giving you more control over your access needs.

  To simplify the process of configuring social connectors, we’re replacing code-edit with simple forms. SAML already supports form configuration, with other connectors coming soon. This means you don’t need to compare documents or worry about code format.

- c12717412: ## Enable connector method `getUserInfo` read and write access to DB

  Logto connectors are designed to be stateless to the extent possible and practical, but it still has some exceptions at times.

  With the recent addition of database read and write access, connectors can now store persistent information. For example, connectors can now store access tokens and refresh tokens to minimize number of requests to social vendor's APIs.

- c12717412: **Customize CSS for Sign-in Experience**

  We have put a lot of effort into improving the user sign-in experience and have provided a brand color option for the UI. However, we know that fine-tuning UI requirements can be unpredictable. While Logto is still exploring the best options for customization, we want to provide a programmatic method to unblock your development.

  You can now use the Management API `PATCH /api/sign-in-exp` with body `{ "customCss": "arbitrary string" }` to set customized CSS for the sign-in experience. You should see the value of `customCss` attached after `<title>` of the page. If the style has a higher priority, it should be able to override.

  > **Note**
  >
  > Since Logto uses CSS Modules, you may see a hash value in the `class` property of DOM elements (e.g. a `<div>` with `vUugRG_container`). To override these, you can use the `$=` CSS selector to match elements that end with a specified value. In this case, it should be `div[class$=container]`.

### Patch Changes

- Updated dependencies [c12717412]
- Updated dependencies [c12717412]
- Updated dependencies [c12717412]
- Updated dependencies [c12717412]
  - @logto/phrases@1.0.0-rc.1
  - @logto/phrases-ui@1.0.0-rc.1
  - @logto/schemas@1.0.0-rc.1
  - @logto/cli@1.0.0-rc.2
  - @logto/shared@1.0.0-rc.1

## 1.0.0-rc.1

### Patch Changes

- 51f527b0: bug fixes

  - core: fix 500 error when enabling app admin access in console
  - ui: handle required profile errors on social binding flow
  - @logto/cli@1.0.0-rc.1

## 1.0.0-rc.0

### Major Changes

- f41fd3f0: drop settings table and add systems table

  **BREAKING CHANGES**

  - core: removed `GET /settings` and `PATCH /settings` API
  - core: added `GET /configs/admin-console` and `PATCH /configs/admin-console` API
    - `/configs/*` APIs are config/key-specific now. they may have different logic per key
  - cli: change valid `logto db config` keys by removing `alterationState` and adding `adminConsole` since:
    - OIDC configs and admin console configs are tenant-level configs (the concept of "tenant" can be ignored until we officially announce it)
    - alteration state is still a system-wide config

### Minor Changes

- f41fd3f0: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- f41fd3f0: Officially cleanup all deprecated `/session` APIs in core and all the related integration tests.
- f41fd3f0: - cli: use `ec` with `secp384r1` as the default key generation type
  - core: use `ES384` as the signing algorithm for EC keys
- fdb2bb48: **Streamlining the social sign-up flow**

  - detect trusted email (or phone number) from the social account
    - email (or phone number) has been registered: automatically connecting the social identity to the existing user account with a single click
    - email (or phone number) not registered: automatically sync up the user profile with the social provided email (or phone) if and only if marked as a required user profile.

- f41fd3f0: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.
- f41fd3f0: Add support to send and verify verification code in management APIs

### Patch Changes

- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
  - @logto/cli@1.0.0-rc.0
  - @logto/schemas@1.0.0-rc.0
  - @logto/shared@1.0.0-rc.0

## 1.0.0-beta.19

### Patch Changes

- Updated dependencies [df9e98dc]
  - @logto/cli@1.0.0-beta.19
  - @logto/schemas@1.0.0-beta.18
  - @logto/shared@1.0.0-beta.18

## 1.0.0-beta.18

### Major Changes

- 1c916011: Packages are now ESM.

### Minor Changes

- 1c916011: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

### Patch Changes

- Updated dependencies [1c916011]
- Updated dependencies [1c916011]
- Updated dependencies [1c916011]
  - @logto/cli@1.0.0-beta.18
  - @logto/phrases@1.0.0-beta.17
  - @logto/phrases-ui@1.0.0-beta.17
  - @logto/schemas@1.0.0-beta.17
  - @logto/shared@1.0.0-beta.17

## 1.0.0-beta.17

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.
- Updated dependencies [38970fb8]
  - @logto/cli@1.0.0-beta.16
  - @logto/phrases@1.0.0-beta.16
  - @logto/schemas@1.0.0-beta.16
  - @logto/shared@1.0.0-beta.16

## 1.0.0-beta.15

### Patch Changes

- Bump connector kit version to fix "Continue" issues on sending email/sms.
- Updated dependencies
  - @logto/schemas@1.0.0-beta.15
  - @logto/cli@1.0.0-beta.15
  - @logto/shared@1.0.0-beta.15

## 1.0.0-beta.14

### Patch Changes

- Updated dependencies [2d45cc3e]
  - @logto/schemas@1.0.0-beta.14
  - @logto/cli@1.0.0-beta.14
  - @logto/shared@1.0.0-beta.14

## 1.0.0-beta.13

### Minor Changes

- 18e3b82e: Add user suspend API endpoint

  Use `PATCH /api/users/:userId/is-suspended` to update a user's suspended state, once a user is suspended, all refresh tokens belong to this user will be revoked.

  Suspended users will get an error toast when trying to sign in.

- 2168936b: **Sign-in Experience v2**

  We are thrilled to announce the release of the newest version of the Sign-in Experience, which includes more ways to sign-in and sign-up, as well as a framework that is easier to understand and more flexible to configure in the Admin Console.

  When compared to Sign-in Experience v1, this version’s capability was expanded so that it could support a greater variety of flexible use cases. For example, now users can sign up with email verification code and sign in with email and password.

  We hope that this will be able to assist developers in delivering a successful sign-in flow, which will also be appreciated by the end users.

- 40286699: **💥 Breaking change 💥**

  Use case-insensitive strategy for searching emails

### Patch Changes

- Updated dependencies [68f2d56a]
- Updated dependencies [3ff2e90c]
  - @logto/phrases@1.0.0-beta.13
  - @logto/phrases-ui@1.0.0-beta.13
  - @logto/cli@1.0.0-beta.13
  - @logto/schemas@1.0.0-beta.13
  - @logto/shared@1.0.0-beta.13

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

**Note:** Version bump only for package @logto/core

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

### ⚠ BREAKING CHANGES

- update scripts

### Features

- **cli:** get/set db config key ([0eff1e3](https://github.com/logto-io/logto/commit/0eff1e3591129802f3e9b3286652ef6fc8619cf5))
- **core,phrases:** add GET /phrase route ([#1959](https://github.com/logto-io/logto/issues/1959)) ([7ce55a8](https://github.com/logto-io/logto/commit/7ce55a8458166d1ca7453f3f637aed202860bf6c))

### Bug Fixes

- add redirectURI validation on frontend & backend ([#1874](https://github.com/logto-io/logto/issues/1874)) ([4b0970b](https://github.com/logto-io/logto/commit/4b0970b6d8c6647a6e68bf27fe3db3aeb635768e))
- **core:** fix deletePasscodeByIds bug ([#2049](https://github.com/logto-io/logto/issues/2049)) ([11b605a](https://github.com/logto-io/logto/commit/11b605a3e7bcef5ecbe24c5a39b8a1a081a54e88))

### Miscellaneous Chores

- update scripts ([c96495a](https://github.com/logto-io/logto/commit/c96495ad4ef778a006f0307a9e0a4bf47d0bfdc7))

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### ⚠ BREAKING CHANGES

- **core:** update `koaAuth()` to inject detailed auth info (#1977)
- **core:** update user scopes (#1922)

### Features

- **core,phrases:** add check protected access function ([e405ef7](https://github.com/logto-io/logto/commit/e405ef7bb8fdbf01d52ef83b19350189e32a39b6))
- **core,schemas:** add phrases schema and GET /custom-phrases/:languageKey route ([#1905](https://github.com/logto-io/logto/issues/1905)) ([7242aa8](https://github.com/logto-io/logto/commit/7242aa8c2bbb70c51e9b00dd5e3aff595c3c2eff))
- **core,schemas:** migration deploy cli ([#1966](https://github.com/logto-io/logto/issues/1966)) ([7cc2f4d](https://github.com/logto-io/logto/commit/7cc2f4d14219145e562cebef41ebb3963083cc89))
- **core,schemas:** use timestamp to version migrations ([bb4bfd3](https://github.com/logto-io/logto/commit/bb4bfd3d41fdd415f68e6e13f0d4a7e8a0093933))
- **core:** add DELETE /custom-phrases/:languageKey route ([#1919](https://github.com/logto-io/logto/issues/1919)) ([c72be69](https://github.com/logto-io/logto/commit/c72be69bea639689721651b20fd559939f6c0ce6))
- **core:** add GET /custom-phrases route ([#1935](https://github.com/logto-io/logto/issues/1935)) ([5fe0cf4](https://github.com/logto-io/logto/commit/5fe0cf4257a72f96fc439132c7b5b58e07352aa3))
- **core:** add POST /session/forgot-password/{email,sms}/send-passcode ([#1963](https://github.com/logto-io/logto/issues/1963)) ([af2600d](https://github.com/logto-io/logto/commit/af2600d828bf315ce57de5813168571e7042d8de))
- **core:** add POST /session/forgot-password/{email,sms}/verify-passcode ([#1968](https://github.com/logto-io/logto/issues/1968)) ([1ea39f3](https://github.com/logto-io/logto/commit/1ea39f346367d9f300be7281a65e689bf198a65c))
- **core:** add POST /session/forgot-password/reset ([#1972](https://github.com/logto-io/logto/issues/1972)) ([acdc86c](https://github.com/logto-io/logto/commit/acdc86c8560d30a89eccb6b0f6892221ea1bc5e0))
- **core:** add PUT /custom-phrases/:languageKey route ([#1907](https://github.com/logto-io/logto/issues/1907)) ([0ae13f0](https://github.com/logto-io/logto/commit/0ae13f091b69c717cc17ed4f400f456f1737fc5c))
- **core:** add ts to interaction result ([#1917](https://github.com/logto-io/logto/issues/1917)) ([e01042c](https://github.com/logto-io/logto/commit/e01042cbcd77c486afa1ee9fc2fa5c1d2df92542))
- **core:** cannot delete custom phrase used as default language in sign-in exp ([#1951](https://github.com/logto-io/logto/issues/1951)) ([a1aef26](https://github.com/logto-io/logto/commit/a1aef26905f624569ee47e43bb3a9c9cf05b997b))
- **core:** check migration state before app start ([#1979](https://github.com/logto-io/logto/issues/1979)) ([bf1d281](https://github.com/logto-io/logto/commit/bf1d281905bcf91a09dd8330212b6db838d65344))
- **core:** deploy migration in transaction mode ([#1980](https://github.com/logto-io/logto/issues/1980)) ([9a89c1a](https://github.com/logto-io/logto/commit/9a89c1a200322c678e2b0246ed324c847e734fc6))
- **core:** machine to machine apps ([cd9c697](https://github.com/logto-io/logto/commit/cd9c6978a35d9fc3a571c7bd56c972939c49a9b5))
- **core:** save empty string as null value in DB ([#1901](https://github.com/logto-io/logto/issues/1901)) ([ecdf06e](https://github.com/logto-io/logto/commit/ecdf06ef39a177b207dc75930e96dfcf2ae12cdc))
- **core:** support base64 format `OIDC_PRIVATE_KEYS` config in `.env` file ([#1903](https://github.com/logto-io/logto/issues/1903)) ([5bdb675](https://github.com/logto-io/logto/commit/5bdb6755d2e1bf5b6a004859561d60f1103aec69))
- **core:** update migration state after db init ([f904b88](https://github.com/logto-io/logto/commit/f904b88f564110c1ed00b2fa1c7b3c1e168fc106))
- **ui:** add passwordless switch ([#1976](https://github.com/logto-io/logto/issues/1976)) ([ddb0e47](https://github.com/logto-io/logto/commit/ddb0e47950b3bd7f92af2a8a5e14b201e0a10ed7))

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))
- **core,schemas:** move alteration types into schemas src ([#2005](https://github.com/logto-io/logto/issues/2005)) ([10c1be6](https://github.com/logto-io/logto/commit/10c1be6eb76e1cb94746aee632a421aea8d4c211))
- **core:** filter out connector-kit ([#1987](https://github.com/logto-io/logto/issues/1987)) ([f4cf89f](https://github.com/logto-io/logto/commit/f4cf89fb8deee7472d8e9bdbcb7ae7364ced1f74))
- support capital letter "Y" in command line prompt ([416f4e8](https://github.com/logto-io/logto/commit/416f4e86e390318dbb0bdb262139ca4ec72ce5fe))

### Code Refactoring

- **core:** update `koaAuth()` to inject detailed auth info ([#1977](https://github.com/logto-io/logto/issues/1977)) ([d4fc7b3](https://github.com/logto-io/logto/commit/d4fc7b3e5f4979f8419b87393bfd1af02e9a191d))
- **core:** update user scopes ([#1922](https://github.com/logto-io/logto/issues/1922)) ([8d22b5c](https://github.com/logto-io/logto/commit/8d22b5c468e5148a3815abf93de14644cdf68e8e))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### ⚠ BREAKING CHANGES

- **core:** load connectors by folder (#1879)

### Features

- add Portuguese translation ([f268ecb](https://github.com/logto-io/logto/commit/f268ecb1a8d57d1e33225bec8852f3bc377dd478))
- **core:** load connectors by folder ([#1879](https://github.com/logto-io/logto/issues/1879)) ([52b9dd8](https://github.com/logto-io/logto/commit/52b9dd8569017ad7fda97a847c95ca1e391aabae))

### Bug Fixes

- fetch connectors list from npm ([#1894](https://github.com/logto-io/logto/issues/1894)) ([c6764f9](https://github.com/logto-io/logto/commit/c6764f95f78ce30148e5439cd08ff87b1608b9b5))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

### Features

- **connector:** add kakao connector ([#1826](https://github.com/logto-io/logto/issues/1826)) ([1f9e820](https://github.com/logto-io/logto/commit/1f9e820eb60d0034b82099fe5a9c96457e47101e))

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

### Features

- **core:** guard session with sign-in mode ([a8a3de3](https://github.com/logto-io/logto/commit/a8a3de35443cec485a435d51b452af0f9a56ed28))

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

### ⚠ BREAKING CHANGES

- **core,console:** remove `/me` apis (#1781)

### Features

- **core:** enable userinfo endpoint ([#1783](https://github.com/logto-io/logto/issues/1783)) ([a6bb2f7](https://github.com/logto-io/logto/commit/a6bb2f7ec239cf036c740fbee79c20c73cf6d694))
- **core:** hasura authn ([#1790](https://github.com/logto-io/logto/issues/1790)) ([87d3a53](https://github.com/logto-io/logto/commit/87d3a53b65ad18be337fffd78aaecd3483c8f33b))
- **core:** set user default roles from env ([#1793](https://github.com/logto-io/logto/issues/1793)) ([4afdf3c](https://github.com/logto-io/logto/commit/4afdf3cb4c868cc85ba1d6b155165515a431d771))

### Bug Fixes

- **core:** fix ac & ui proxy under subpath deployment ([#1761](https://github.com/logto-io/logto/issues/1761)) ([163c23b](https://github.com/logto-io/logto/commit/163c23b9bd3019e1187de9dec1a2fdd2201630f7))
- **deps:** update dependency slonik to v30 ([#1744](https://github.com/logto-io/logto/issues/1744)) ([a9f99db](https://github.com/logto-io/logto/commit/a9f99db54e8b6e8c951832d800a1eedc311234c2))

### Code Refactoring

- **core,console:** remove `/me` apis ([#1781](https://github.com/logto-io/logto/issues/1781)) ([2c6171c](https://github.com/logto-io/logto/commit/2c6171c2f97b5122c13dd959f507399b9a9d6aa4))

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

### ⚠ BREAKING CHANGES

- **core:** use comma separated values as a string array in the env file (#1762)

### Features

- **core,schemas:** add application secret ([#1715](https://github.com/logto-io/logto/issues/1715)) ([543ee04](https://github.com/logto-io/logto/commit/543ee04f53f81b41b0669f0ac5773fc67d500c0c))
- **core:** support signing key rotation ([#1732](https://github.com/logto-io/logto/issues/1732)) ([00bab4c](https://github.com/logto-io/logto/commit/00bab4c09582797c31d9bc5c7fe6d3c4b44a2f36))
- **core:** use comma separated values as a string array in the env file ([#1762](https://github.com/logto-io/logto/issues/1762)) ([f6db981](https://github.com/logto-io/logto/commit/f6db981600fd16a860262336ad88d886ca502628))

### Bug Fixes

- **deps:** update dependency slonik to v29 ([#1700](https://github.com/logto-io/logto/issues/1700)) ([21a0c8f](https://github.com/logto-io/logto/commit/21a0c8f635cd561417dd23bca1d899771da6321a))

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Features

- **connector:** azure active directory connector added ([#1662](https://github.com/logto-io/logto/issues/1662)) ([875a828](https://github.com/logto-io/logto/commit/875a82883161b79b11873bcfce2856e7b84502b4))
- **phrases:** tr language ([#1707](https://github.com/logto-io/logto/issues/1707)) ([411a8c2](https://github.com/logto-io/logto/commit/411a8c2fa2bfb16c4fef5f0a55c3c1dc5ead1124))

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

### Features

- **core:** api GET /me ([#1650](https://github.com/logto-io/logto/issues/1650)) ([4bf6483](https://github.com/logto-io/logto/commit/4bf6483ff4674052d4b5d00d647c0c408b3ecc7f))
- **core:** refresh token rotation reuse interval ([#1617](https://github.com/logto-io/logto/issues/1617)) ([bb245ad](https://github.com/logto-io/logto/commit/bb245adbb917dd066db2fe9cfbdbe102394e2c0e))
- **core:** support integration test env config ([#1619](https://github.com/logto-io/logto/issues/1619)) ([708523e](https://github.com/logto-io/logto/commit/708523ed5287683cc23c6a93e01fe55dbd838e8c))

### Bug Fixes

- **core:** resolve some core no-restricted-syntax lint error ([#1606](https://github.com/logto-io/logto/issues/1606)) ([c56ddec](https://github.com/logto-io/logto/commit/c56ddec84ade4da1385d9821a1149375a70167dd))
- **deps:** update dependency koa-router to v12 ([#1596](https://github.com/logto-io/logto/issues/1596)) ([6e96d73](https://github.com/logto-io/logto/commit/6e96d73a7c187c5dd25a7977654387ad2f33f3b2))

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

### Features

- **core:** add response guard ([#1542](https://github.com/logto-io/logto/issues/1542)) ([6c39790](https://github.com/logto-io/logto/commit/6c397901805b01613df71eecaa06d3d84d0b606a))

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

### Features

- **core:** add admin guard to signin ([#1523](https://github.com/logto-io/logto/issues/1523)) ([3e76de0](https://github.com/logto-io/logto/commit/3e76de0ac9ed1be5ad3903fc1c3863673014d9c2))
- **core:** read connector packages env ([#1478](https://github.com/logto-io/logto/issues/1478)) ([adadcbe](https://github.com/logto-io/logto/commit/adadcbe21619da325673ef3f96f1ddc1a073540d))

### Bug Fixes

- **connector:** fix connector getConfig and validateConfig type ([#1530](https://github.com/logto-io/logto/issues/1530)) ([88a54aa](https://github.com/logto-io/logto/commit/88a54aaa9ebce419c149a33150a4927296cb705b))
- **connector:** passwordless connector send test msg with unsaved config ([#1539](https://github.com/logto-io/logto/issues/1539)) ([0297f6c](https://github.com/logto-io/logto/commit/0297f6c52f7b5d730de44fbb08f88c2e9b951874))
- **connector:** refactor ConnectorInstance as class ([#1541](https://github.com/logto-io/logto/issues/1541)) ([6b9ad58](https://github.com/logto-io/logto/commit/6b9ad580ae86fbcc100a100aab1d834090e682a3))
- **ui,core:** fix i18n issue ([#1548](https://github.com/logto-io/logto/issues/1548)) ([6b58d8a](https://github.com/logto-io/logto/commit/6b58d8a1610b1b75155d873e8898786d2b723ec6))

## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)

### Features

- **connector:** connector error handler, throw errmsg on general errors ([#1458](https://github.com/logto-io/logto/issues/1458)) ([7da1de3](https://github.com/logto-io/logto/commit/7da1de33e97de4aeeec9f9b6cea59d1bf90ba623))
- expose zod error ([#1474](https://github.com/logto-io/logto/issues/1474)) ([81b63f0](https://github.com/logto-io/logto/commit/81b63f07bb412abf1f2b42059bac2ffcfc86272c))

### Bug Fixes

- **core:** add session check ([#1453](https://github.com/logto-io/logto/issues/1453)) ([78e06d5](https://github.com/logto-io/logto/commit/78e06d5c7f458d9174f4d057ba83f738717510f5))

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

### Features

- **core:** append additional yaml responses to swagger.json ([#1407](https://github.com/logto-io/logto/issues/1407)) ([100bffb](https://github.com/logto-io/logto/commit/100bffbc6aa51478bda432ba01491a708bdcd172))

### Bug Fixes

- **core,ui:** remove todo comments ([#1454](https://github.com/logto-io/logto/issues/1454)) ([d5d6c5e](https://github.com/logto-io/logto/commit/d5d6c5ed083364dabaa0220deaa6a22e0350d146))
- **deps:** update dependency koa-router to v11 ([#1406](https://github.com/logto-io/logto/issues/1406)) ([ff6f223](https://github.com/logto-io/logto/commit/ff6f2235eaa2a146f11de9299e38fb1b7fae9bc6))

## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)

**Note:** Version bump only for package @logto/core

## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)

### Bug Fixes

- **core:** do not titlize tags of .well-known APIs ([#1412](https://github.com/logto-io/logto/issues/1412)) ([5559fb1](https://github.com/logto-io/logto/commit/5559fb10c33932300d9f863cb3f57c48c504acdc))

## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)

### Features

- **core:** auto sign-out ([#1369](https://github.com/logto-io/logto/issues/1369)) ([6c32340](https://github.com/logto-io/logto/commit/6c323403b391ac09100aad87e7c9f59b588bdd45))

### [0.1.2-alpha.2](https://github.com/logto-io/logto/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.0](https://github.com/logto-io/logto/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2022-07-02)

**Note:** Version bump only for package @logto/core

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **ac:** implement admin console welcome page ([#1139](https://github.com/logto-io/logto/issues/1139)) ([b42f4ba](https://github.com/logto-io/logto/commit/b42f4ba1ff11c769efece9f5cea75014924516fc))
- **connector-alipay-native:** add Alipay Native connector ([#873](https://github.com/logto-io/logto/issues/873)) ([9589aea](https://github.com/logto-io/logto/commit/9589aeafec8592531aa1dfe598ca6cec7325eded))
- **connector-sendgrid-email:** add sendgrid email connector ([#850](https://github.com/logto-io/logto/issues/850)) ([b887655](https://github.com/logto-io/logto/commit/b8876558275e28ca921d4eeea6c38f8559810a11))
- **connector-twilio-sms:** add twilio sms connector ([#881](https://github.com/logto-io/logto/issues/881)) ([d7ce13d](https://github.com/logto-io/logto/commit/d7ce13d260ec79e0c0f68bf3068cb9c79adf5273))
- **connector:** apple ([#966](https://github.com/logto-io/logto/issues/966)) ([7400ed8](https://github.com/logto-io/logto/commit/7400ed8896fdceda6165a0540413efb4e3a47438))
- **connectors:** handle authorization callback parameters in each connector respectively ([#1166](https://github.com/logto-io/logto/issues/1166)) ([097aade](https://github.com/logto-io/logto/commit/097aade2e2e1b1ea1531bcb4c1cca8d24961a9b9))
- **console,core:** hide admin user ([#1182](https://github.com/logto-io/logto/issues/1182)) ([9194a6e](https://github.com/logto-io/logto/commit/9194a6ee547e2eb83ec106a834409c33644481e5))
- **console:** add column lastSignIn in user management ([#679](https://github.com/logto-io/logto/issues/679)) ([a0b4b98](https://github.com/logto-io/logto/commit/a0b4b98c35ff08c2df0863e4bc2110386fc54aee))
- **console:** dark logo ([#860](https://github.com/logto-io/logto/issues/860)) ([664a218](https://github.com/logto-io/logto/commit/664a2180a51b577fb517661cf0d7efb1374f3858))
- **console:** sie form reorg ([#1218](https://github.com/logto-io/logto/issues/1218)) ([2c41334](https://github.com/logto-io/logto/commit/2c413341d1c515049faa130416f7a5e591d10e8a))
- **console:** support persisting get-started progress in settings config ([43b2309](https://github.com/logto-io/logto/commit/43b2309c994b2eb8b1b8f1c12893eb66b5ce1d95))
- **core,connectors:** update Aliyun logo and add logo_dark to Apple, Github ([#1194](https://github.com/logto-io/logto/issues/1194)) ([98f8083](https://github.com/logto-io/logto/commit/98f808320b1c79c51f8bd6f49e35ca44363ea560))
- **core,console:** change admin user password ([#1268](https://github.com/logto-io/logto/issues/1268)) ([a4d0a94](https://github.com/logto-io/logto/commit/a4d0a940bdabb213866407afb6c064b6740ce593))
- **core,console:** connector platform tabs ([#887](https://github.com/logto-io/logto/issues/887)) ([65fb36c](https://github.com/logto-io/logto/commit/65fb36ce3fd021cd44aeff95c4a01e75fe1352e7))
- **core,console:** social connector targets ([#851](https://github.com/logto-io/logto/issues/851)) ([127664a](https://github.com/logto-io/logto/commit/127664a62f1b1c794569b7fe9d0bfceb7b97dc74))
- **core,schemas:** koaLogSession middleware ([#767](https://github.com/logto-io/logto/issues/767)) ([4e60446](https://github.com/logto-io/logto/commit/4e6044641190faaa2ee4f8d4765118e381df8a30))
- **core,schemas:** log IP and user agent ([#682](https://github.com/logto-io/logto/issues/682)) ([0ecb7e4](https://github.com/logto-io/logto/commit/0ecb7e4d2fe869ada46cc39e0fef98d2240cb1b2))
- **core,schemas:** log token exchange success ([#809](https://github.com/logto-io/logto/issues/809)) ([3b048a8](https://github.com/logto-io/logto/commit/3b048a80a374ff720a5afe3b35f007b31fddd576))
- **core,schemas:** save application id that the user first consented ([#688](https://github.com/logto-io/logto/issues/688)) ([4521c3c](https://github.com/logto-io/logto/commit/4521c3c8d17becb6b322fc0128fff992f34d2a0d))
- **core,shared:** get /dashboard/users/active ([#953](https://github.com/logto-io/logto/issues/953)) ([1420bb2](https://github.com/logto-io/logto/commit/1420bb28cec9c0e20b4d0645a58e436135f87c83))
- **core:** add admin role validation to the koaAuth ([#920](https://github.com/logto-io/logto/issues/920)) ([cf360b9](https://github.com/logto-io/logto/commit/cf360b9c15594b0923c79adf3a401e29d84fad23))
- **core:** add custom claims to id token ([#911](https://github.com/logto-io/logto/issues/911)) ([9ccda93](https://github.com/logto-io/logto/commit/9ccda932a45816be2089d3e58c8e91f55b9ecce9))
- **core:** add etag for settings api ([#1011](https://github.com/logto-io/logto/issues/1011)) ([d4f38bc](https://github.com/logto-io/logto/commit/d4f38bce2b016ddd4e6d5f260e04c7e0f4f312f7))
- **core:** add phone number and email mask ([#891](https://github.com/logto-io/logto/issues/891)) ([67f080e](https://github.com/logto-io/logto/commit/67f080e8623de0417436f9897f1179e6cdc62130))
- **core:** add role table seed ([#1145](https://github.com/logto-io/logto/issues/1145)) ([837ad52](https://github.com/logto-io/logto/commit/837ad523cef4a41ab9fdddfe7a92b6ed074114a0))
- **core:** add sign-in-mode ([#1132](https://github.com/logto-io/logto/issues/1132)) ([f640dad](https://github.com/logto-io/logto/commit/f640dad52f2e75620b392114673860138e1aca2c))
- **core:** add smtp connector ([#1131](https://github.com/logto-io/logto/issues/1131)) ([f8710e1](https://github.com/logto-io/logto/commit/f8710e147d1299a53598e68188044a5f25caf2e3))
- **core:** add socialConnectors details for get sign-in-settings ([#804](https://github.com/logto-io/logto/issues/804)) ([7a922cb](https://github.com/logto-io/logto/commit/7a922cbd331b45443f7f19a8af3dcd9156453079))
- **core:** add switch of enabling object fully replace when updating DB ([#1107](https://github.com/logto-io/logto/issues/1107)) ([efa9491](https://github.com/logto-io/logto/commit/efa9491749f6702ba0d15ab50818e8a9622fdd90))
- **core:** add welcome route ([#1080](https://github.com/logto-io/logto/issues/1080)) ([f6f562a](https://github.com/logto-io/logto/commit/f6f562a8ba2c67793246eded995285eb5b68c1c7))
- **core:** align connector error handler middleware with ConnectorErrorCodes ([#1063](https://github.com/logto-io/logto/issues/1063)) ([1b8190a](https://github.com/logto-io/logto/commit/1b8190addfd33bf9a317f991023984a2efdb6796))
- **core:** any-type parameter shows empty object in swagger example ([#1110](https://github.com/logto-io/logto/issues/1110)) ([7339a85](https://github.com/logto-io/logto/commit/7339a85a1bb4f1a8c69a05fb5bfd61f154b24eb7))
- **core:** append page and page_size to the query parameters in swagger.json ([#1120](https://github.com/logto-io/logto/issues/1120)) ([a262999](https://github.com/logto-io/logto/commit/a26299941f71fd6cae51380c05a9e49f4fae2084))
- **core:** convert route guards to swagger.json ([#1047](https://github.com/logto-io/logto/issues/1047)) ([3145c9b](https://github.com/logto-io/logto/commit/3145c9b34824e9107a98625dc2998f605a936ae8))
- **core:** convert Zod union, literal and string guards to OpenAPI schemas ([#1126](https://github.com/logto-io/logto/issues/1126)) ([511012d](https://github.com/logto-io/logto/commit/511012da92bf1cae9e8429b343f4554b8c4230f0))
- **core:** cookie keys configuration ([#902](https://github.com/logto-io/logto/issues/902)) ([17c63cd](https://github.com/logto-io/logto/commit/17c63cd2d9fe5f3f66fe2404a7358f0d8524e667))
- **core:** dau curve contains 0 count points ([#1105](https://github.com/logto-io/logto/issues/1105)) ([75ac874](https://github.com/logto-io/logto/commit/75ac874a2d02e308d6a63f4925e3f9b2c3377b8d))
- **core:** disable introspection feature ([#886](https://github.com/logto-io/logto/issues/886)) ([b2ac2c1](https://github.com/logto-io/logto/commit/b2ac2c14eead0fba45dec90115f75dd2074e04ee))
- **core:** empty path sould redirect to the console page ([#915](https://github.com/logto-io/logto/issues/915)) ([207c404](https://github.com/logto-io/logto/commit/207c404aebd062f2f46742748ed08c5d97368dbc))
- **core:** expose connector and metadata from sendPasscode ([#806](https://github.com/logto-io/logto/issues/806)) ([0ea5513](https://github.com/logto-io/logto/commit/0ea55134a92252a00f6b3532cdde71ae96979452))
- **core:** fix connectors' initialization ([c6f2546](https://github.com/logto-io/logto/commit/c6f2546126ec48da0ef28f939a062c844c03b2b7))
- **core:** get /dashboard/users/new ([#940](https://github.com/logto-io/logto/issues/940)) ([45a9777](https://github.com/logto-io/logto/commit/45a977790eca01b212f51047d5636ff882873dd8))
- **core:** get /dashboard/users/total ([#936](https://github.com/logto-io/logto/issues/936)) ([c4bb0de](https://github.com/logto-io/logto/commit/c4bb0de7d426055b3634d8e4dace5cface7f2f0f))
- **core:** get /logs ([#823](https://github.com/logto-io/logto/issues/823)) ([4ffd4c0](https://github.com/logto-io/logto/commit/4ffd4c048028567f701e5a3d6a507907b63a0151))
- **core:** get /logs/:id ([#934](https://github.com/logto-io/logto/issues/934)) ([bddf47b](https://github.com/logto-io/logto/commit/bddf47bf90213397688f3566f0018029e5959709))
- **core:** grantErrorListener for logging token exchange error ([#894](https://github.com/logto-io/logto/issues/894)) ([797344f](https://github.com/logto-io/logto/commit/797344f6f5e3b64e1d8861eeeac0d18cb59032f2))
- **core:** grantRevokedListener for logging revocation of access and refresh token ([#900](https://github.com/logto-io/logto/issues/900)) ([e5196fc](https://github.com/logto-io/logto/commit/e5196fc31dc1c4ec8086c9df2d1cc8f5486af380))
- **core:** identities key should use target not connectorId ([#1115](https://github.com/logto-io/logto/issues/1115)) ([41e37a7](https://github.com/logto-io/logto/commit/41e37a79955ac4f6437c4e52c1cf3f74adaad811)), closes [#1134](https://github.com/logto-io/logto/issues/1134)
- **core:** log error body ([#1065](https://github.com/logto-io/logto/issues/1065)) ([2ba1121](https://github.com/logto-io/logto/commit/2ba11215edc8bc83efcd41e1587b53fddc5bb101))
- **core:** log sending passcode with connector id ([#824](https://github.com/logto-io/logto/issues/824)) ([82c7138](https://github.com/logto-io/logto/commit/82c7138683f1027a227b3939d7516e0912773fe5))
- **core:** make GET /api/swagger.json contain all api routes ([#1008](https://github.com/logto-io/logto/issues/1008)) ([8af2f95](https://github.com/logto-io/logto/commit/8af2f953cf826cc5c72c0b7a0ae30d50b8caa6d9))
- **core:** order logs by created_at desc ([#993](https://github.com/logto-io/logto/issues/993)) ([2ae4e2e](https://github.com/logto-io/logto/commit/2ae4e2eccfd3699516d4d192f42607fea2b56623))
- **core:** register with admin role ([#1140](https://github.com/logto-io/logto/issues/1140)) ([4f32ad3](https://github.com/logto-io/logto/commit/4f32ad3a511985b1ccb8706cff3b604c86a7d50b))
- **core:** remove code redundancy ([d989785](https://github.com/logto-io/logto/commit/d98978565864852b4885ecf5f4d2fb1fa807601c))
- **core:** remove unnecessary variable check and unused route ([#1084](https://github.com/logto-io/logto/issues/1084)) ([bcc05e5](https://github.com/logto-io/logto/commit/bcc05e521d3b0017421b7a3ae30a7e5e2b015b87))
- **core:** separate social sign-in api ([#735](https://github.com/logto-io/logto/issues/735)) ([e71cf7e](https://github.com/logto-io/logto/commit/e71cf7ea67dbd22eac6a3aa12aa20687c00aa7e6))
- **core:** serve connector logo ([#931](https://github.com/logto-io/logto/issues/931)) ([5b44b71](https://github.com/logto-io/logto/commit/5b44b7194ed4f98c6c2e77aae828a39b477b6010))
- **core:** set claims for `profile` scope ([#1013](https://github.com/logto-io/logto/issues/1013)) ([7781d49](https://github.com/logto-io/logto/commit/7781d496676cc233b4d62214fa11e9fdfda21929))
- **core:** update connector db schema ([#732](https://github.com/logto-io/logto/issues/732)) ([8e1533a](https://github.com/logto-io/logto/commit/8e1533a70267d459feea4e5174296b17bef84d48))
- **demo-app:** implementation ([#982](https://github.com/logto-io/logto/issues/982)) ([7f4f4f8](https://github.com/logto-io/logto/commit/7f4f4f84addf8a25c3d30f1ac3ceeef460afcf17))
- **demo-app:** implementation (3/3) ([#1021](https://github.com/logto-io/logto/issues/1021)) ([91e2f05](https://github.com/logto-io/logto/commit/91e2f055f2eb75ef8846b02d0d211adbbb898b41))
- **native-connectors:** pass random state to native connector sdk ([#922](https://github.com/logto-io/logto/issues/922)) ([9679620](https://github.com/logto-io/logto/commit/96796203dd4247d7ecdee044f13f3d57f04ca461))
- remove target, platform from connector schema and add id to metadata ([#930](https://github.com/logto-io/logto/issues/930)) ([054b0f7](https://github.com/logto-io/logto/commit/054b0f7b6a6dfed66540042ea69b0721126fe695))
- update field check rules ([#854](https://github.com/logto-io/logto/issues/854)) ([85a407c](https://github.com/logto-io/logto/commit/85a407c5f6f76fed0513acd6fb41943413935b5a))
- use user level custom data to save preferences ([#1045](https://github.com/logto-io/logto/issues/1045)) ([f2b44b4](https://github.com/logto-io/logto/commit/f2b44b49f9763b365b0062000146fee2b8df72a9))

### Bug Fixes

- `lint:report` script ([#730](https://github.com/logto-io/logto/issues/730)) ([3b17324](https://github.com/logto-io/logto/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
- **connector-wechat-native:** fix wechat-native target ([#820](https://github.com/logto-io/logto/issues/820)) ([ab6c124](https://github.com/logto-io/logto/commit/ab6c1246207fd191b1db27d172500a5e7a2d8050))
- connectors platform ([#925](https://github.com/logto-io/logto/issues/925)) ([16ec018](https://github.com/logto-io/logto/commit/16ec018b711baeec28a22a7780370044c230bd24))
- **console,core:** only show enabled connectors in sign in methods ([#988](https://github.com/logto-io/logto/issues/988)) ([4768181](https://github.com/logto-io/logto/commit/4768181bf77261eb84a1c4cb903fa0a22765d837))
- **console:** update terms of use ([#1122](https://github.com/logto-io/logto/issues/1122)) ([9262a6f](https://github.com/logto-io/logto/commit/9262a6f3beb7c2c46708453ce7d667dc5b39da8e))
- **console:** update user data ([#1184](https://github.com/logto-io/logto/issues/1184)) ([a3d3a79](https://github.com/logto-io/logto/commit/a3d3a79dd9c93c2bd23af78da1eb45de81642c3f))
- **core,console:** delete specific user identities by target ([#1176](https://github.com/logto-io/logto/issues/1176)) ([ad86bc8](https://github.com/logto-io/logto/commit/ad86bc8e120e571268cffbb45fe3c8253c1207fe))
- **core:** align jsonb replace mode ([#1138](https://github.com/logto-io/logto/issues/1138)) ([3cf34b5](https://github.com/logto-io/logto/commit/3cf34b59112a2d20cdc1f1dfc0d2802a27c886c2))
- **core:** allow empty condition in logs ([#991](https://github.com/logto-io/logto/issues/991)) ([2819859](https://github.com/logto-io/logto/commit/28198590faa16b010dfb8050738a1f9a60f26bd9))
- **core:** catch interaction not found error ([#827](https://github.com/logto-io/logto/issues/827)) ([38ceae7](https://github.com/logto-io/logto/commit/38ceae78536fadabd1abfb845c3172908d4662b4))
- **core:** disabled session check for preview mode ([#867](https://github.com/logto-io/logto/issues/867)) ([82674ee](https://github.com/logto-io/logto/commit/82674eea885e6819213f10833b6a5a66dec9f6ac))
- **core:** fix connector readme and configTemplate content parsing ([#1267](https://github.com/logto-io/logto/issues/1267)) ([05db124](https://github.com/logto-io/logto/commit/05db12492c98c42b760a86a339838ee4b6d5ca6d))
- **core:** fix preview session not found bug ([#970](https://github.com/logto-io/logto/issues/970)) ([545a392](https://github.com/logto-io/logto/commit/545a3929e4e0bd8853c142ec5ca27520ba428da1))
- **core:** koaAuth should return 403 instead of 401 on non-admin role ([ee16eeb](https://github.com/logto-io/logto/commit/ee16eeb9662d99d04a8d2c2770f89f0641f1e743))
- **core:** prevent session lost for bind social ([#948](https://github.com/logto-io/logto/issues/948)) ([077ed12](https://github.com/logto-io/logto/commit/077ed120f09cdfdb81e95cbb434488569f87bfd1))
- **core:** remove ESM declaration ([#687](https://github.com/logto-io/logto/issues/687)) ([e61dba9](https://github.com/logto-io/logto/commit/e61dba90a815f8bd2ab72861c7e8bcefcfcc4b0d))
- **core:** remove name regex ([#1109](https://github.com/logto-io/logto/issues/1109)) ([a790248](https://github.com/logto-io/logto/commit/a790248c091e444614652b08b05686e9934cb639))
- **core:** remove unavailable social sign in targets on save ([#1201](https://github.com/logto-io/logto/issues/1201)) ([012562e](https://github.com/logto-io/logto/commit/012562e2a8226525b4d4b8c80eb092b1780e0221))
- **core:** revert add custom claims to id token ([#919](https://github.com/logto-io/logto/issues/919)) ([fe99928](https://github.com/logto-io/logto/commit/fe99928a41e1987f7fd078b711c9a0bb2c86e5c9))
- **core:** set module in base config ([#685](https://github.com/logto-io/logto/issues/685)) ([d108f4b](https://github.com/logto-io/logto/commit/d108f4b8833ea86ccfe74b2165e844493f738da4))
- **core:** settings api should not throw session not found error ([#1157](https://github.com/logto-io/logto/issues/1157)) ([e0793fa](https://github.com/logto-io/logto/commit/e0793facb92d0b10a0c52e3346f4fd4ad81662cd))
- **core:** signing in with a non-existing username should throw invalid credentials ([#1239](https://github.com/logto-io/logto/issues/1239)) ([53781d6](https://github.com/logto-io/logto/commit/53781d619dedc4e51d87d4ad917d0dbfcc1510d9))
- **core:** social user info in session ([#794](https://github.com/logto-io/logto/issues/794)) ([74f2940](https://github.com/logto-io/logto/commit/74f2940398ecdfe00f0d8306f01451d859cff186))
- **core:** update proxy guard middleware ([#963](https://github.com/logto-io/logto/issues/963)) ([909535f](https://github.com/logto-io/logto/commit/909535f4af95b40ac8714a92afb5cbd48f4fa47b))
- **core:** update role names ([#913](https://github.com/logto-io/logto/issues/913)) ([d659995](https://github.com/logto-io/logto/commit/d65999514f9d3d516bc18e1e0396eff8b42daa50))
- **core:** update roleNames to role_names to resolve 401 errors ([5a1fa14](https://github.com/logto-io/logto/commit/5a1fa14a981cba0fa7314941902a8d017fad42f3))
- **core:** update timestamp field with millisecond precision ([#677](https://github.com/logto-io/logto/issues/677)) ([7278ba4](https://github.com/logto-io/logto/commit/7278ba40958ca57468e562a6978c25e6c993dd20))
- delete custom domain ([#737](https://github.com/logto-io/logto/issues/737)) ([8a48fb6](https://github.com/logto-io/logto/commit/8a48fb6225f9850aeec7917a54d849fd9a88254e))
- **ui:** fix sign-in not found bug ([#841](https://github.com/logto-io/logto/issues/841)) ([5d34442](https://github.com/logto-io/logto/commit/5d34442018d0577ff3f90d57008d2af5d4f5b54b))
