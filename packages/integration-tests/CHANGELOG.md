# Change Log

## 1.17.0

### Minor Changes

- d551f5ccc3: support creating third-party SPA and Native applications

  Previously, only traditional web applications could be marked as third-party apps. Now you can also create third-party single-page applications (SPA) and native applications, enabling more flexible OAuth/OIDC integration scenarios.

## 1.16.0

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

## 1.15.0

### Minor Changes

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

## 1.14.0

### Minor Changes

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

## 1.13.1

### Patch Changes

- 3cf7ee141: fix potential WebAuthn registration errors by specifying the displayName

  This is an optional field, but it's actually required by some browsers. For example, when using Chrome on Windows 11 with the "Use other devices" option (scanning QR code), an empty displayName will cause the registration to fail.

## 1.13.0

### Minor Changes

- 35bbc4399: add phone number validation and parsing to ensure the correct format when updating an existing user’s primary phone number or creating a new user with a phone number

## 1.12.0

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

- 2961d355d: bump node version to ^22.14.0

## 1.11.1

### Patch Changes

- e11e57de8: bump dependencies for security update

## 1.11.0

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

## 1.10.0

### Minor Changes

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

## 1.9.0

### Minor Changes

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

### Patch Changes

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

## 1.8.0

### Minor Changes

- 510f681fa: use tsup for building

  We've updated some of the packages to use `tsup` for building. This will make the build process faster, and should not affect the functionality of the packages.

  Use minor version bump to catch your attention.

### Patch Changes

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

## 1.7.0

### Minor Changes

- 061a30a87: support agree to terms polices for Logto’s sign-in experiences

  - Automatic: Users automatically agree to terms by continuing to use the service
  - ManualRegistrationOnly: Users must agree to terms by checking a box during registration, and don't need to agree when signing in
  - Manual: Users must agree to terms by checking a box during registration or signing in

### Patch Changes

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

- ef21c7a99: support per-organization multi-factor authentication requirement

  An organization can now require its member to have multi-factor authentication (MFA) configured. If an organization has this requirement and a member does not have MFA configured, the member will not be able to fetch the organization access token.

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

## 1.6.1

### Patch Changes

- 5b03030de: Not allow to modify management API resource through API.

  Previously, management API resource and its scopes are readonly in Console. But it was possible to modify through the API. This is not allowed anymore.

## 1.6.0

### Minor Changes

- 468558721: Get organization roles with search keyword.
- cc01acbd0: Create a new user through API with password digest and corresponding algorithm

### Patch Changes

- abffb9f95: full oidc standard claims support

  We have added support for the remaining [OpenID Connect standard claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims). Now, these claims are accessible in both ID tokens and the response from the `/me` endpoint.

  Additionally, we adhere to the standard scopes - claims mapping. This means that you can retrieve most of the profile claims using the `profile` scope, and the `address` claim can be obtained by using the `address` scope.

  For all newly introduced claims, we store them in the `user.profile` field.

  > ![Note]
  > Unlike other database fields (e.g. `name`), the claims stored in the `profile` field will fall back to `undefined` rather than `null`. We refrain from using `?? null` here to reduce the size of ID tokens, since `undefined` fields will be stripped in tokens.

## 1.5.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3

## 1.4.3

### Patch Changes

- 9a4da065d: fix incorrect swagger components

## 1.4.2

### Patch Changes

- 1ab39d19b: fix 500 error when using search component in console to filter both roles and applications.

## 1.4.1

### Patch Changes

- f8408fa77: rename the package `phrases-ui` to `phrases-experience`
- f6723d5e2: rename the package `ui` to `experience`

## 1.4.0

### Minor Changes

- ecbecd8e4: various application improvements

  - Show OpenID Provider configuration endpoint in Console
  - Configure "Rotate Refresh Token" in Console
  - Configure "Refresh Token TTL" in Console

## 1.3.0

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

## 1.2.0

### Minor Changes

- 9a3aa3aae: Automatically sync the trusted social email and phone info to the new registered user profile

## 1.1.0

## 1.0.3

## 1.0.2

## 1.0.1

## 1.0.0

### Major Changes

- 1c9160112: Packages are now ESM.

### Minor Changes

- f41fd3f05: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- 343b1090f: Allow admin tenant admin to create tenants without limitation
- f41fd3f05: Officially cleanup all deprecated `/session` APIs in core and all the related integration tests.
- f41fd3f05: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.
- 402866994: **💥 Breaking change 💥**

  Use case-insensitive strategy for searching emails

### Patch Changes

- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.

## 1.0.0-rc.3

## 1.0.0-rc.2

## 1.0.0-rc.1

## 1.0.0-rc.0

### Minor Changes

- f41fd3f0: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- f41fd3f0: Officially cleanup all deprecated `/session` APIs in core and all the related integration tests.
- f41fd3f0: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.

## 1.0.0-beta.19

## 1.0.0-beta.18

### Major Changes

- 1c916011: Packages are now ESM.

## 1.0.0-beta.17

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.

## 1.0.0-beta.15

## 1.0.0-beta.14

## 1.0.0-beta.13

### Minor Changes

- 40286699: **💥 Breaking change 💥**

  Use case-insensitive strategy for searching emails

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

**Note:** Version bump only for package @logto/integration-tests

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

**Note:** Version bump only for package @logto/integration-tests

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### ⚠ BREAKING CHANGES

- **core:** load connectors by folder (#1879)

### Features

- **core:** load connectors by folder ([#1879](https://github.com/logto-io/logto/issues/1879)) ([52b9dd8](https://github.com/logto-io/logto/commit/52b9dd8569017ad7fda97a847c95ca1e391aabae))

### Bug Fixes

- downgrade to sdk 1.0.0-beta.2 ([#1896](https://github.com/logto-io/logto/issues/1896)) ([91d1bf8](https://github.com/logto-io/logto/commit/91d1bf8004165e3ab42dfd705046ef7f3bd612d9))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/integration-tests

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

**Note:** Version bump only for package @logto/integration-tests

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

### ⚠ BREAKING CHANGES

- **core,console:** remove `/me` apis (#1781)

### Code Refactoring

- **core,console:** remove `/me` apis ([#1781](https://github.com/logto-io/logto/issues/1781)) ([2c6171c](https://github.com/logto-io/logto/commit/2c6171c2f97b5122c13dd959f507399b9a9d6aa4))

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

**Note:** Version bump only for package @logto/integration-tests

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Bug Fixes

- **test:** run integration test serially ([#1676](https://github.com/logto-io/logto/issues/1676)) ([8394f7b](https://github.com/logto-io/logto/commit/8394f7bb2ed5736bb2cd7857edd558602d236c6f))

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

### Bug Fixes

- **test:** use demo app to test username-password flow in integration test ([#1635](https://github.com/logto-io/logto/issues/1635)) ([a258587](https://github.com/logto-io/logto/commit/a258587b4e804615b6a51e336a1af04478d91437))

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

**Note:** Version bump only for package @logto/integration-tests

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

**Note:** Version bump only for package @logto/integration-tests

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

**Note:** Version bump only for package @logto/integration-tests

## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)

**Note:** Version bump only for package @logto/integration-tests

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/integration-tests

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/integration-tests

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **shared,phrases-ui:** not allow hyphens in username ([#1319](https://github.com/logto-io/logto/issues/1319)) ([5e81966](https://github.com/logto-io/logto/commit/5e819665c7c1d584ff5cff25e4e0723122be78b2))
