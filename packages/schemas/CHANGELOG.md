# Change Log

## 1.18.0

### Minor Changes

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

- 942780fcf: support Google One Tap

  - core: `GET /api/.well-known/sign-in-exp` now returns `googleOneTap` field with the configuration when available
  - core: add Google Sign-In (GSI) url to the security headers
  - core: verify Google One Tap CSRF token in `verifySocialIdentity()`
  - phrases: add Google One Tap phrases
  - schemas: migrate sign-in experience types from core to schemas

- Updated dependencies [6308ee185]
- Updated dependencies [15953609b]
- Updated dependencies [6308ee185]
- Updated dependencies [942780fcf]
- Updated dependencies [87615d58c]
- Updated dependencies [9f33d997b]
- Updated dependencies [061a30a87]
- Updated dependencies [ef21c7a99]
- Updated dependencies [136320584]
- Updated dependencies [efa884c40]
- Updated dependencies [b50ba0b7e]
- Updated dependencies [d81e13d21]
  - @logto/connector-kit@4.0.0
  - @logto/phrases@1.12.0
  - @logto/phrases-experience@1.7.0

## 1.17.0

### Minor Changes

- 25d67f33f: create a pre-configured role with Management API access when seeding the database
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

- 76fd33b7e: support default roles for users

### Patch Changes

- Updated dependencies [e04d9523a]
- Updated dependencies [0c70d65c7]
- Updated dependencies [76fd33b7e]
  - @logto/phrases@1.11.0
  - @logto/core-kit@2.5.0

## 1.16.0

### Minor Changes

- 21bb35b12: refactor the definition of hook event types

  - Add `DataHook` event types. `DataHook` are triggered by data changes.
  - Add "interaction" prefix to existing hook event types. Interaction hook events are triggered by end user interactions, e.g. completing sign-in.

- e8c41b164: support organization custom data

  Now you can save additional data associated with the organization with the organization-level `customData` field by:

  - Edit in the Console organization details page.
  - Specify `customData` field when using organization Management APIs.

### Patch Changes

- Updated dependencies [5b03030de]
- Updated dependencies [21bb35b12]
- Updated dependencies [3486b12e8]
  - @logto/phrases@1.10.1
  - @logto/shared@3.1.1

## 1.15.0

### Minor Changes

- abffb9f95: full oidc standard claims support

  We have added support for the remaining [OpenID Connect standard claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims). Now, these claims are accessible in both ID tokens and the response from the `/me` endpoint.

  Additionally, we adhere to the standard scopes - claims mapping. This means that you can retrieve most of the profile claims using the `profile` scope, and the `address` claim can be obtained by using the `address` scope.

  For all newly introduced claims, we store them in the `user.profile` field.

  > ![Note]
  > Unlike other database fields (e.g. `name`), the claims stored in the `profile` field will fall back to `undefined` rather than `null`. We refrain from using `?? null` here to reduce the size of ID tokens, since `undefined` fields will be stripped in tokens.

- 2cbc591ff: add oidc params variables and types

  - Add `ExtraParamsKey` enum for all possible OIDC extra parameters that Logto supports.
  - Add `FirstScreen` enum for the `first_screen` parameter.
  - Add `extraParamsObjectGuard` guard and `ExtraParamsObject` type for shaping the extra parameters object in the OIDC authentication request.

- cc01acbd0: Create a new user through API with password digest and corresponding algorithm

### Patch Changes

- 951865859: ## Resolve third-party app's /interaction/consent endpoint 500 error

  ### Reproduction steps

  - Create an organization scope with an empty description and assign this scope to a third-party application.
  - Login to the third-party application and request the organization scope.
  - Proceed through the interaction flow until reaching the consent page.
  - An internal server error 500 is returned.

  ### Root cause

  For the `/interaction/consent` endpoint, the organization scope is returned alongside other resource scopes in the `missingResourceScopes` property.

  In the `consentInfoResponseGuard`, we utilize the resource Scopes zod guard to validate the `missingResourceScopes` property. However, the description field in the resource scope is mandatory while organization scopes'description is optional. An organization scope with an empty description will not pass the validation.

  ### Solution

  Alter the resource scopes table to make the description field nullable. Related Scope zod guard and the consentInfoResponseGuard will be updated to reflect this change. Align the resource scopes table with the organization scopes table to ensure consistency.

- Updated dependencies [5758f84f5]
- Updated dependencies [57d97a4df]
- Updated dependencies [abffb9f95]
- Updated dependencies [746483c49]
- Updated dependencies [57d97a4df]
- Updated dependencies [cc01acbd0]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/phrases@1.10.0
  - @logto/connector-kit@3.0.0
  - @logto/core-kit@2.4.0
  - @logto/phrases-experience@1.6.1
  - @logto/shared@3.1.0

## 1.14.0

## 1.13.1

## 1.13.0

### Minor Changes

- a2ce0be46: add tenant role enum and scope enum
- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

- 32df9acde: update Logto application schemas to support the new third-party application feature (Logto as IdP)

  - Applications table alteration. Add new column `is_third_party` to indicate if the application is a third-party application.
  - Create new table `application_user_consent_resource_scopes` to store the enabled user consent resource scopes for the third-party application.
  - Create new table `application_user_consent_organization_scopes` to store the enabled user consent organization scopes for the third-party application.
  - Create new table `application_user_consent_user_scopes` to store the enabled user consent user scopes for the third-party application.
  - Create new table `application_user_consent_organizations` to store the user granted organizations for the third-party application.
  - Create new table `application_sign_in_experiences` to store the application level sign-in experiences for the third-party application.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [acb7fd3fe]
- Updated dependencies [9089dbf84]
- Updated dependencies [04ec78a91]
- Updated dependencies [32df9acde]
- Updated dependencies [31e60811d]
- Updated dependencies [570a4ea9e]
- Updated dependencies [570a4ea9e]
- Updated dependencies [6befe6014]
  - @logto/shared@3.1.0
  - @logto/connector-kit@2.1.0
  - @logto/language-kit@1.1.0
  - @logto/phrases-experience@1.6.0
  - @logto/core-kit@2.3.0
  - @logto/phrases@1.9.0

## 1.12.0

### Minor Changes

- 9a7b19e49: Add single sign-on (SSO) table and schema definitions

  - Add new sso_connectors table, which is used to store the SSO connector data.
  - Add new user_sso_identities table, which is used to store the user's SSO identity data received from IdP through a SSO interaction.
  - Add new single_sign_on_enabled column to the sign_in_experiences table, which is used to indicate if the SSO feature is enabled for the sign-in experience.
  - Define new SSO feature related types

### Patch Changes

- 3e92a2032: refactor: add user ip to webhook event payload
- Updated dependencies [9a7b19e49]
- Updated dependencies [becf59169]
- Updated dependencies [b4f702a86]
- Updated dependencies [9a7b19e49]
  - @logto/phrases@1.8.0
  - @logto/core-kit@2.2.1
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

- Updated dependencies [6727f629d]
  - @logto/phrases@1.7.0
  - @logto/phrases-experience@1.4.0

## 1.10.1

### Patch Changes

- 46d0d4c0b: convert private signing key type from string to JSON object, in order to provide additional information such as key ID and creation timestamp.
- Updated dependencies [87df417d1]
- Updated dependencies [d24aaedf5]
  - @logto/phrases@1.6.0
  - @logto/connector-kit@2.0.0
  - @logto/shared@3.0.0

## 1.10.0

### Patch Changes

- Updated dependencies [2c340d379]
  - @logto/core-kit@2.2.0

## 1.9.2

### Patch Changes

- 18181f892: standardize id and secret generators

  - Remove `buildIdGenerator` export from `@logto/shared`
  - Add `generateStandardSecret` and `generateStandardShortId` exports to `@logto/shared`
  - Align comment and implementation of `buildIdGenerator` in `@logto/shared`
    - The comment stated the function will include uppercase letters by default, but it did not; Now it does.
  - Use `generateStandardSecret` for all secret generation

- Updated dependencies [18181f892]
  - @logto/shared@3.0.0
  - @logto/core-kit@2.1.2

## 1.9.1

### Patch Changes

- Updated dependencies [6f5a0acad]
  - @logto/phrases-experience@1.3.1
  - @logto/core-kit@2.1.1

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
- 5d78c7271: Add `type` field to `roles` schema.

  `type` can be either 'User' or 'MachineToMachine' in our case, this change distinguish between the two types of roles.
  Roles with type 'MachineToMachine' are not allowed to be assigned to users and 'User' roles can not be assigned to machine-to-machine apps.
  It's worth noting that we do not differentiate by `scope` (or `permission` in Admin Console), so a scope can be assigned to both the 'User' role and the 'MachineToMachine' role simultaneously.

### Patch Changes

- f8408fa77: rename the package `phrases-ui` to `phrases-experience`
- f6723d5e2: rename the package `ui` to `experience`
- Updated dependencies [e8b0b1d02]
- Updated dependencies [f8408fa77]
- Updated dependencies [f6723d5e2]
- Updated dependencies [310698b0d]
  - @logto/phrases@1.5.0
  - @logto/phrases-experience@1.3.0
  - @logto/core-kit@2.1.0
  - @logto/shared@2.0.1

## 1.8.0

### Patch Changes

- 0b519e548: allow non-http origins for application CORS

## 1.7.0

### Minor Changes

- 5ccdd7f31: Record daily active users

## 1.6.0

### Minor Changes

- ecbecd8e4: various application improvements

  - Show OpenID Provider configuration endpoint in Console
  - Configure "Rotate Refresh Token" in Console
  - Configure "Refresh Token TTL" in Console

### Patch Changes

- Updated dependencies [e9c2c9a6d]
- Updated dependencies [ecbecd8e4]
  - @logto/core-kit@2.0.1
  - @logto/phrases@1.4.1

## 1.5.0

### Minor Changes

- 2cab3787c: Add cloudflare configurations to system
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

- 497d5b526: Support updating sign-in identifiers in user details form
  - Admin can now update user sign-in identifiers (username, email, phone number) in the user details form in user management.
  - Other trivial improvements and fixes, e.g. input field placeholder, error handling, etc.
- Updated dependencies [268dc50e7]
- Updated dependencies [fa0dbafe8]
- Updated dependencies [497d5b526]
  - @logto/phrases@1.4.0

## 1.4.0

### Minor Changes

- 5d6720805: add config `alwaysIssueRefreshToken` for web apps to unblock OAuth integrations that are not strictly conform OpenID Connect.

  when it's enabled, Refresh Tokens will be always issued regardless if `prompt=consent` was present in the authorization request.

### Patch Changes

- Updated dependencies [5d6720805]
  - @logto/phrases@1.3.0

## 1.3.1

## 1.3.0

### Patch Changes

- beb6ebad5: ## Add min length 1 type guard for all string typed db schema fields

  Update the `@logto/schemas` zod guard generation method to include a min length of 1 for all the required string typed db fields.

## 1.2.3

## 1.2.2

## 1.2.1

## 1.2.0

### Patch Changes

- 457cb2822: Adding social connectors will now mark the related get-started action item as completed.
- Updated dependencies [ae6a54993]
- Updated dependencies [206fba2b5]
- Updated dependencies [4945b0be2]
- Updated dependencies [c5eb3a2ba]
- Updated dependencies [5553425fc]
- Updated dependencies [30033421c]
  - @logto/phrases@1.2.0
  - @logto/phrases-ui@1.2.0
  - @logto/shared@2.0.0
  - @logto/core-kit@2.0.0
  - @logto/connector-kit@1.1.1

## 1.1.0

### Patch Changes

- Updated dependencies [f9ca7cc49]
- Updated dependencies [37714d153]
- Updated dependencies [f3d60a516]
- Updated dependencies [5c50957a9]
- Updated dependencies [e9e8a6e11]
  - @logto/phrases@1.1.0
  - @logto/phrases-ui@1.1.0

## 1.0.7

### Patch Changes

- 5b4da1e3d: force bump to fix npm publishment

## 1.0.1

### Patch Changes

- 621b09ba1: force version bump

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
- f41fd3f05: drop settings table and add systems table

  **BREAKING CHANGES**

  - core: removed `GET /settings` and `PATCH /settings` API
  - core: added `GET /configs/admin-console` and `PATCH /configs/admin-console` API
    - `/configs/*` APIs are config/key-specific now. they may have different logic per key
  - cli: change valid `logto db config` keys by removing `alterationState` and adding `adminConsole` since:
    - OIDC configs and admin console configs are tenant-level configs (the concept of "tenant" can be ignored until we officially announce it)
    - alteration state is still a system-wide config

### Minor Changes

- 343b1090f: Add demo social connectors for new tenant
- f41fd3f05: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- 343b1090f: ### Add dynamic favicon and html title

  - Add the favicon field in the sign-in-experience branding settings. Users would be able to upload their own favicon. Use local logto icon as a fallback

  - Set different html title for different pages.
    - sign-in
    - register
    - forgot-password
    - logto

- 343b1090f: Allow admin tenant admin to create tenants without limitation
- 343b1090f: ### Add privacy policy url

  In addition to the terms of service url, we also provide a privacy policy url field in the sign-in-experience settings. To better support the end-users' privacy declaration needs.

- 343b1090f: **Add `sessionNotFoundRedirectUrl` tenant config**

  - User can use this optional config to designate the URL to redirect if session not found in Sign-in Experience.
  - Session guard now works for root path as well.

- 343b1090f: remove the branding style config and make the logo URL config optional
- 1c9160112: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

- 343b1090f: ### Add custom content sign-in-experience settings to allow insert custom static html content to the logto sign-in pages

  - feat: combine with the custom css, give the user the ability to further customize the sign-in pages

- f41fd3f05: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.

### Patch Changes

- e63f5f8b0: Bump connector kit version to fix "Continue" issues on sending email/sms.
- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.
- 343b1090f: **Seed data for cloud**

  - cli!: remove `oidc` option for `database seed` command as it's unused
  - cli: add hidden `--cloud` option for `database seed` command to init cloud data
  - cli, cloud: appending Redirect URIs to Admin Console will deduplicate values before update
  - move `UrlSet` and `GlobalValues` to `@logto/shared`

- 7fb689b73: Fix version lifecycle script
- 2d45cc3e6: Update alteration script names after versioning
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [68f2d56a2]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [38970fb88]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [1c9160112]
- Updated dependencies [343b1090f]
- Updated dependencies [1c9160112]
  - @logto/phrases-ui@1.0.0
  - @logto/phrases@1.0.0
  - @logto/connector-kit@1.1.0
  - @logto/core-kit@1.1.0

## 1.0.0-rc.1

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

### Patch Changes

- Updated dependencies [c12717412]
- Updated dependencies [c12717412]
- Updated dependencies [c12717412]
  - @logto/phrases@1.0.0-rc.1
  - @logto/phrases-ui@1.0.0-rc.1

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
- f41fd3f0: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.

## 1.0.0-beta.18

### Patch Changes

- df9e98dc: Fix version lifecycle script

## 1.0.0-beta.17

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
  - @logto/phrases@1.0.0-beta.17
  - @logto/phrases-ui@1.0.0-beta.17

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.
- Updated dependencies [38970fb8]
  - @logto/phrases@1.0.0-beta.16

## 1.0.0-beta.15

### Patch Changes

- Bump connector kit version to fix "Continue" issues on sending email/sms.

## 1.0.0-beta.14

### Patch Changes

- 2d45cc3e: Update alteration script names after versioning

## 1.0.0-beta.13

### Patch Changes

- Updated dependencies [68f2d56a]
  - @logto/phrases@1.0.0-beta.13
  - @logto/phrases-ui@1.0.0-beta.13

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

### Bug Fixes

- add tables to schemas files ([582f3d6](https://github.com/logto-io/logto/commit/582f3d615862c3d8b2c00d8e60a3617429d48e30))
- handle versioning when no `next-*.ts` found ([#2202](https://github.com/logto-io/logto/issues/2202)) ([61336df](https://github.com/logto-io/logto/commit/61336dfbc833c96ddce88be5082b82a30527ee73))
- make packages public ([e24fd04](https://github.com/logto-io/logto/commit/e24fd0479bc20c92bd38b5e214abe441404ce496))

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

### Features

- **cli:** `db alteration deploy` command ([a5280a2](https://github.com/logto-io/logto/commit/a5280a2afd3d5822e78d1f115ab6f6fdbb993261))
- **cli:** `db seed oidc` command ([911117a](https://github.com/logto-io/logto/commit/911117a785fd43ea03473f42835f2680cccca7be))
- **cli:** get/set db config key ([0eff1e3](https://github.com/logto-io/logto/commit/0eff1e3591129802f3e9b3286652ef6fc8619cf5))

### Bug Fixes

- add redirectURI validation on frontend & backend ([#1874](https://github.com/logto-io/logto/issues/1874)) ([4b0970b](https://github.com/logto-io/logto/commit/4b0970b6d8c6647a6e68bf27fe3db3aeb635768e))
- alteration script in dev ([9ebb3dd](https://github.com/logto-io/logto/commit/9ebb3ddfd963f6459ea332dbe1384058f77b453b))

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### Features

- **core,schemas:** add phrases schema and GET /custom-phrases/:languageKey route ([#1905](https://github.com/logto-io/logto/issues/1905)) ([7242aa8](https://github.com/logto-io/logto/commit/7242aa8c2bbb70c51e9b00dd5e3aff595c3c2eff))
- **core,schemas:** migration deploy cli ([#1966](https://github.com/logto-io/logto/issues/1966)) ([7cc2f4d](https://github.com/logto-io/logto/commit/7cc2f4d14219145e562cebef41ebb3963083cc89))
- **core,schemas:** use timestamp to version migrations ([bb4bfd3](https://github.com/logto-io/logto/commit/bb4bfd3d41fdd415f68e6e13f0d4a7e8a0093933))
- **core:** add POST /session/forgot-password/{email,sms}/send-passcode ([#1963](https://github.com/logto-io/logto/issues/1963)) ([af2600d](https://github.com/logto-io/logto/commit/af2600d828bf315ce57de5813168571e7042d8de))
- **core:** add POST /session/forgot-password/{email,sms}/verify-passcode ([#1968](https://github.com/logto-io/logto/issues/1968)) ([1ea39f3](https://github.com/logto-io/logto/commit/1ea39f346367d9f300be7281a65e689bf198a65c))
- **core:** add POST /session/forgot-password/reset ([#1972](https://github.com/logto-io/logto/issues/1972)) ([acdc86c](https://github.com/logto-io/logto/commit/acdc86c8560d30a89eccb6b0f6892221ea1bc5e0))
- **core:** machine to machine apps ([cd9c697](https://github.com/logto-io/logto/commit/cd9c6978a35d9fc3a571c7bd56c972939c49a9b5))
- **schemas:** add logto configs table ([#1940](https://github.com/logto-io/logto/issues/1940)) ([577ca48](https://github.com/logto-io/logto/commit/577ca48c072ed511550e339f2d6d1ee25cedeeac))

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))
- **core,schemas:** move alteration types into schemas src ([#2005](https://github.com/logto-io/logto/issues/2005)) ([10c1be6](https://github.com/logto-io/logto/commit/10c1be6eb76e1cb94746aee632a421aea8d4c211))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

### Features

- **core,schemas:** add application secret ([#1715](https://github.com/logto-io/logto/issues/1715)) ([543ee04](https://github.com/logto-io/logto/commit/543ee04f53f81b41b0669f0ac5773fc67d500c0c))
- **schemas:** guard string max length ([#1737](https://github.com/logto-io/logto/issues/1737)) ([cdf210d](https://github.com/logto-io/logto/commit/cdf210df100c4105eb095f693b7cb31a005d62b8))

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

### Features

- **core:** add response guard ([#1542](https://github.com/logto-io/logto/issues/1542)) ([6c39790](https://github.com/logto-io/logto/commit/6c397901805b01613df71eecaa06d3d84d0b606a))

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)

### Features

- expose zod error ([#1474](https://github.com/logto-io/logto/issues/1474)) ([81b63f0](https://github.com/logto-io/logto/commit/81b63f07bb412abf1f2b42059bac2ffcfc86272c))

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)

### Bug Fixes

- **ui:** dark mode seed ([#1426](https://github.com/logto-io/logto/issues/1426)) ([be73dbf](https://github.com/logto-io/logto/commit/be73dbf4ef14cf49779775dd95848ba73904a4b2))

## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)

**Note:** Version bump only for package @logto/schemas

## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)

**Note:** Version bump only for package @logto/schemas

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/schemas

### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/schemas

### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)

**Note:** Version bump only for package @logto/schemas

### [0.1.2-alpha.2](https://github.com/logto-io/schemas/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)

**Note:** Version bump only for package @logto/schemas

### [0.1.2-alpha.1](https://github.com/logto-io/schemas/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/schemas

### [0.1.2-alpha.0](https://github.com/logto-io/schemas/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2022-07-02)

**Note:** Version bump only for package @logto/schemas

### [0.1.1-alpha.0](https://github.com/logto-io/schemas/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **console,ui:** generate dark mode color in console ([#1231](https://github.com/logto-io/schemas/issues/1231)) ([f72b21d](https://github.com/logto-io/schemas/commit/f72b21d1602ab0fb35ef3e7d84f6c8ebd7e18b08))
- **console:** add application column in user management ([#728](https://github.com/logto-io/schemas/issues/728)) ([a035587](https://github.com/logto-io/schemas/commit/a0355872c65bc0da27e57e25568fbe5dcc5b671b))
- **console:** add column lastSignIn in user management ([#679](https://github.com/logto-io/schemas/issues/679)) ([a0b4b98](https://github.com/logto-io/schemas/commit/a0b4b98c35ff08c2df0863e4bc2110386fc54aee))
- **console:** audit log table ([#1000](https://github.com/logto-io/schemas/issues/1000)) ([fdd12de](https://github.com/logto-io/schemas/commit/fdd12de1cf39c36dd65dd9365ad343478718d112))
- **console:** configure cors-allowed-origins ([#695](https://github.com/logto-io/schemas/issues/695)) ([4a0577a](https://github.com/logto-io/schemas/commit/4a0577accdb36e2b916b0e520b3352f6426b64c7))
- **console:** dark logo ([#860](https://github.com/logto-io/schemas/issues/860)) ([664a218](https://github.com/logto-io/schemas/commit/664a2180a51b577fb517661cf0d7efb1374f3858))
- **console:** hide get-started page on clicking 'Hide this' button ([7fd42fd](https://github.com/logto-io/schemas/commit/7fd42fdaa17217f8be6ea120e287ea243904977a))
- **console:** integrate dark mode settings ([a04f818](https://github.com/logto-io/schemas/commit/a04f818ffb8627a5c3d594edb466d1b8e45e3015))
- **console:** log details page ([#1064](https://github.com/logto-io/schemas/issues/1064)) ([0421195](https://github.com/logto-io/schemas/commit/04211957e1222f9597c32afd2982258afa73fa31))
- **console:** sie form reorg ([#1218](https://github.com/logto-io/schemas/issues/1218)) ([2c41334](https://github.com/logto-io/schemas/commit/2c413341d1c515049faa130416f7a5e591d10e8a))
- **console:** sign in exp guide ([#755](https://github.com/logto-io/schemas/issues/755)) ([bafd094](https://github.com/logto-io/schemas/commit/bafd09474c68ca5539d676d2cbf06fa16e070edb))
- **console:** support persisting get-started progress in settings config ([43b2309](https://github.com/logto-io/schemas/commit/43b2309c994b2eb8b1b8f1c12893eb66b5ce1d95))
- **core,console:** social connector targets ([#851](https://github.com/logto-io/schemas/issues/851)) ([127664a](https://github.com/logto-io/schemas/commit/127664a62f1b1c794569b7fe9d0bfceb7b97dc74))
- **core,schemas:** koaLogSession middleware ([#767](https://github.com/logto-io/schemas/issues/767)) ([4e60446](https://github.com/logto-io/schemas/commit/4e6044641190faaa2ee4f8d4765118e381df8a30))
- **core,schemas:** log IP and user agent ([#682](https://github.com/logto-io/schemas/issues/682)) ([0ecb7e4](https://github.com/logto-io/schemas/commit/0ecb7e4d2fe869ada46cc39e0fef98d2240cb1b2))
- **core,schemas:** log token exchange success ([#809](https://github.com/logto-io/schemas/issues/809)) ([3b048a8](https://github.com/logto-io/schemas/commit/3b048a80a374ff720a5afe3b35f007b31fddd576))
- **core,schemas:** save application id that the user first consented ([#688](https://github.com/logto-io/schemas/issues/688)) ([4521c3c](https://github.com/logto-io/schemas/commit/4521c3c8d17becb6b322fc0128fff992f34d2a0d))
- **core:** add experience configs ([#745](https://github.com/logto-io/schemas/issues/745)) ([08904b8](https://github.com/logto-io/schemas/commit/08904b8f93f39cfd24dae88746e5b18ce35ff0b4))
- **core:** add role table seed ([#1145](https://github.com/logto-io/schemas/issues/1145)) ([837ad52](https://github.com/logto-io/schemas/commit/837ad523cef4a41ab9fdddfe7a92b6ed074114a0))
- **core:** add sign-in-mode ([#1132](https://github.com/logto-io/schemas/issues/1132)) ([f640dad](https://github.com/logto-io/schemas/commit/f640dad52f2e75620b392114673860138e1aca2c))
- **core:** grantRevokedListener for logging revocation of access and refresh token ([#900](https://github.com/logto-io/schemas/issues/900)) ([e5196fc](https://github.com/logto-io/schemas/commit/e5196fc31dc1c4ec8086c9df2d1cc8f5486af380))
- **core:** log error body ([#1065](https://github.com/logto-io/schemas/issues/1065)) ([2ba1121](https://github.com/logto-io/schemas/commit/2ba11215edc8bc83efcd41e1587b53fddc5bb101))
- **core:** log sending passcode with connector id ([#824](https://github.com/logto-io/schemas/issues/824)) ([82c7138](https://github.com/logto-io/schemas/commit/82c7138683f1027a227b3939d7516e0912773fe5))
- **core:** update connector db schema ([#732](https://github.com/logto-io/schemas/issues/732)) ([8e1533a](https://github.com/logto-io/schemas/commit/8e1533a70267d459feea4e5174296b17bef84d48))
- **demo-app:** implementation ([#982](https://github.com/logto-io/schemas/issues/982)) ([7f4f4f8](https://github.com/logto-io/schemas/commit/7f4f4f84addf8a25c3d30f1ac3ceeef460afcf17))
- **demo-app:** implementation (3/3) ([#1021](https://github.com/logto-io/schemas/issues/1021)) ([91e2f05](https://github.com/logto-io/schemas/commit/91e2f055f2eb75ef8846b02d0d211adbbb898b41))
- **demo-app:** show notification in main flow ([#1038](https://github.com/logto-io/schemas/issues/1038)) ([90ca76e](https://github.com/logto-io/schemas/commit/90ca76eeb5460b66d2241f137f179bf4d5d6ae37))
- remove target, platform from connector schema and add id to metadata ([#930](https://github.com/logto-io/schemas/issues/930)) ([054b0f7](https://github.com/logto-io/schemas/commit/054b0f7b6a6dfed66540042ea69b0721126fe695))
- **schemas:** create log indices on application id and user id ([#933](https://github.com/logto-io/schemas/issues/933)) ([bf6e08c](https://github.com/logto-io/schemas/commit/bf6e08c37233da372bc5570f9855df023704a93b))
- **schemas:** make users.avatar URL length 2048 ([#1141](https://github.com/logto-io/schemas/issues/1141)) ([3ac01d7](https://github.com/logto-io/schemas/commit/3ac01d72f9d30eca5836dcfbddd1700ebb3ddac1))
- update field check rules ([#854](https://github.com/logto-io/schemas/issues/854)) ([85a407c](https://github.com/logto-io/schemas/commit/85a407c5f6f76fed0513acd6fb41943413935b5a))
- use user level custom data to save preferences ([#1045](https://github.com/logto-io/schemas/issues/1045)) ([f2b44b4](https://github.com/logto-io/schemas/commit/f2b44b49f9763b365b0062000146fee2b8df72a9))

### Bug Fixes

- `lint:report` script ([#730](https://github.com/logto-io/schemas/issues/730)) ([3b17324](https://github.com/logto-io/schemas/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
- **console:** align usage of customizeSignInExperience ([#837](https://github.com/logto-io/schemas/issues/837)) ([808a676](https://github.com/logto-io/schemas/commit/808a676da6239fa0471c65f9920bd9715bfe4c19))
- **console:** update terms of use ([#1122](https://github.com/logto-io/schemas/issues/1122)) ([9262a6f](https://github.com/logto-io/schemas/commit/9262a6f3beb7c2c46708453ce7d667dc5b39da8e))
- delete custom domain ([#737](https://github.com/logto-io/schemas/issues/737)) ([8a48fb6](https://github.com/logto-io/schemas/commit/8a48fb6225f9850aeec7917a54d849fd9a88254e))
- **schemas:** remove user foreign key on application id ([#964](https://github.com/logto-io/schemas/issues/964)) ([9d8ef76](https://github.com/logto-io/schemas/commit/9d8ef7632b2d1d2094eae1b232eba334342e5d74))
