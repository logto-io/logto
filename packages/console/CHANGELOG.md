# Change Log

## 1.16.0

### Minor Changes

- eacec10ac: improve machine-to-machine application integration user experience

  - Display a role assignment modal to facilitate setting permissions for the newly created machine-to-machine app.
  - In the role assignment modal, add a Logto icon to roles that carry the Logto Management API access permission, making it easier for users to select roles with Logto Management API access permission.
  - Add a notification for machine-to-machine roles to guide users in using the machine-to-machine role by creating a machine-to-machine application.
  - Improve machine-to-machine application integration guide.

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

- ead51e555: add Ruby app guide
- ef21c7a99: support per-organization multi-factor authentication requirement

  An organization can now require its member to have multi-factor authentication (MFA) configured. If an organization has this requirement and a member does not have MFA configured, the member will not be able to fetch the organization access token.

- 0ef712e4e: support Google One Tap configuration
- 15953609b: support the dynamic config rendering for connector multi-select configuration
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

- 9f33d997b: view and update user's `profile` property in the user settings page
- 06ef19905: fix a regression bug that error toasts pop up in audit log when logs are associated with deleted applications
- af44e87eb: add Chrome extension guide
- 136320584: allow skipping manual account linking during sign-in

  You can find this configuration in Console -> Sign-in experience -> Sign-up and sign-in -> Social sign-in -> Automatic account linking.

  When switched on, if a user signs in with a social identity that is new to the system, and there is exactly one existing account with the same identifier (e.g., email), Logto will automatically link the account with the social identity instead of prompting the user for account linking.

- d81e13d21: display OIDC issuer endpoint in the application details form

## 1.15.0

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

- a0b19513b: show version number in the topbar
- 76fd33b7e: support default roles for users

### Patch Changes

- e04d9523a: replace the i18n translated hook event label with the hook event value directly in the console

  - remove all the legacy interaction hook events i18n phrases
  - replace the translated label with the hook event value directly in the console
    - `Create new account` -> `PostRegister`
    - `Sign in` -> `PostSignIn`
    - `Reset password` -> `PostResetPassword`

- 558986d28: update documentation reference links
- c558affac: improve error handling on audit logs

  - No longer toasts error messages if the audit log related user entity has been removed.
  - Display a fallback `user-id (deleted)` information instead.

## 1.14.0

### Minor Changes

- 21bb35b12: refactor the definition of hook event types

  - Add `DataHook` event types. `DataHook` are triggered by data changes.
  - Add "interaction" prefix to existing hook event types. Interaction hook events are triggered by end user interactions, e.g. completing sign-in.

- 5872172cb: enable custom JWT feature for OSS version

  OSS version users can now use custom JWT feature to add custom claims to JWT access tokens payload (previously, this feature was only available to Logto Cloud).

- 6fe6f87bc: support adding API resource permissions to organization roles and organization permissions in 3rd-party applications

  ## Updates

  - Separated the "Organization template" from the "Organization" page, establishing it as a standalone page for clearer navigation and functionality.
  - Enhanced the "Organization template" page by adding functionality that allows users to click on an organization role, which then navigates to the organization role details page where users can view its corresponding permissions and general settings.
  - Enabled the assignment of API resource permissions directly from the organization role details page, improving role management and access control.
  - Split the permission list for third-party apps into two separate lists: user permissions and organization permissions. Users can now add user profile permissions and API resource permissions for users under user permissions, and add organization permissions and API resource permissions for organizations under organization permissions.

### Patch Changes

- 9cf03c8ed: Add Java Spring Boot web integration guide to the application creation page

## 1.13.0

### Minor Changes

- 5758f84f5: feat(console): support signing-key rotation

### Patch Changes

- 746483c49: api resource indicator must be a valid absolute uri

  An invalid indicator will make Console crash without this check.

  Note: We don't mark it as a breaking change as the api behavior has not changed, only adding the check on Console.

## 1.12.1

### Patch Changes

- 677054a24: add Angular, Nuxt, SvelteKit, Expo (React Native) guides

## 1.12.0

### Minor Changes

- c14cd1827: add .NET Core Blazor Server guide
- 32df9acde: add third-party application management pages

  - Add the new application category `Third-party` to the application creation page.
  - Add the new application framework `OIDC IdP` to the application creation page.
  - Add new tab `Third-party apps` to the applications management page. Split the existing applications list into `My apps` and `Third-party apps` two different tab for better management.
  - Reorg the application details page form. Remove the `Advance settings` tab and merge all the OIDC configuration fields into the `Settings` tab.
  - Add new `Permissions` tab to the third-party application details page. Display the user consent resource, organization, and user scopes. And allow the user to manage the user granted organizations for the third-party application.
  - Add new `Branding` tab to the third-party application details page. Allow the user to manage the application level sign-in experiences for the third-party application.

- 715dba2ce: add .NET Core Blazor WASM guide
- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3
- 04ec78a91: improve error handling when user associated application is removed
- 8c4bfbce1: Remove the upsell tag on social connectors creation modal in OSS version.

## 1.11.0

### Minor Changes

- 9a7b19e49: Add single sign-on (SSO) management pages

  - Implement new enterprise SSO management pages. Allow create and manage SSO connectors through Logto console.
  - Add enabled/disable SSO toggle switch on the sign-in-experience settings page.

- becf59169: introduce Logto Organizations

  The term "organization" is also used in other forms, such as "workspace", "team", "company", etc. In Logto, we use "organization" as the generic term to represent the concept of multi-tenancy.

  From now, you can create multiple organizations in Logto, each of which can have its own users, while in the same identity pool.

  Plus, we also introduce the concept of "organization template". It is a set of permissions and roles that applies to all organizations, while a user can have different roles in different organizations.

  See [🏢 Organizations (Multi-tenancy)](https://docs.logto.io/docs/recipes/organizations/) for more details.

### Patch Changes

- 9421375d7: Bump libphonenumber-js to v1.10.51 to support China 19 started phone numbers. Thanks to @agileago

## 1.10.0

### Minor Changes

- 6727f629d: feature: introduce multi-factor authentication

  We're excited to announce that Logto now supports multi-factor authentication (MFA) for your sign-in experience. Navigate to the "Multi-factor auth" tab to configure how you want to secure your users' accounts.

  In this release, we introduce the following MFA methods:

  - Authenticator app OTP: users can add any authenticator app that supports the TOTP standard, such as Google Authenticator, Duo, etc.
  - WebAuthn (Passkey): users can use the standard WebAuthn protocol to register a hardware security key, such as biometric keys, Yubikey, etc.
  - Backup codes：users can generate a set of backup codes to use when they don't have access to other MFA methods.

  For a smooth transition, we also support to configure the MFA policy to require MFA for sign-in experience, or to allow users to opt-in to MFA.

## 1.9.0

### Minor Changes

- 87df417d1: feat: support HTTP for webhook requests

### Patch Changes

- 1ab39d19b: fix 500 error when using search component in console to filter both roles and applications.

## 1.8.0

### Minor Changes

- a8b5a020f: feature: machine-to-machine (M2M) role-based access control (RBAC)

  ### Summary

  This feature enables Logto users to apply role-based access control (RBAC) to their machine-to-machine (M2M) applications.

  With the update, Logto users can now effectively manage permissions for their M2M applications, resulting in improved security and flexibility.

  #### New role type: machine-to-machine

  We have introduced a new role type, "machine-to-machine".

  - When creating a new role, you can select the type (either "machine-to-machine" or "user" type), with "user" type by default if not specified.
  - Logto now ONLY allows the selection of the role type during role creation.

  #### Manage "machine-to-machine" roles

  You can manage the permissions of a "machine-to-machine" role in the same way as a "user" role.

  > Logto's management API resources are available to "machine-to-machine" roles but not for "user" roles.
  > "machine-to-machine" roles can only be assigned to M2M applications; and "user" roles can only be assigned to users.

  You can assign "machine-to-machine" roles to M2M applications in the following two ways:

  - "Applications" on sidebar -> Select an M2M application -> "Roles" tab -> "Assign Roles" button
  - "Roles" on sidebar -> Select an M2M role -> "Machine-to-machine apps" tab -> "Assign Applications" button

### Patch Changes

- 18181f892: standardize id and secret generators

  - Remove `buildIdGenerator` export from `@logto/shared`
  - Add `generateStandardSecret` and `generateStandardShortId` exports to `@logto/shared`
  - Align comment and implementation of `buildIdGenerator` in `@logto/shared`
    - The comment stated the function will include uppercase letters by default, but it did not; Now it does.
  - Use `generateStandardSecret` for all secret generation

## 1.7.1

### Patch Changes

- a4b44dde5: add more intuitive code samples and fix mistakes in express api guide

## 1.7.0

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

### Patch Changes

- f8408fa77: rename the package `phrases-ui` to `phrases-experience`
- 18e05586c: fix the app crash when inputting verification code in Console profile page
- f6723d5e2: rename the package `ui` to `experience`

## 1.6.0

### Minor Changes

- d90b4e7f6: add asp.net core tutorial

### Patch Changes

- 0b519e548: allow non-http origins for application CORS

## 1.5.1

### Patch Changes

- 16d83dd2f: Allow editing refresh token TTL for non-M2M applications (include SPA type)

## 1.5.0

### Minor Changes

- ecbecd8e4: various application improvements

  - Show OpenID Provider configuration endpoint in Console
  - Configure "Rotate Refresh Token" in Console
  - Configure "Refresh Token TTL" in Console

## 1.4.0

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

- 497d5b526: Support updating sign-in identifiers in user details form
  - Admin can now update user sign-in identifiers (username, email, phone number) in the user details form in user management.
  - Other trivial improvements and fixes, e.g. input field placeholder, error handling, etc.

## 1.3.0

### Minor Changes

- 5d6720805: add config `alwaysIssueRefreshToken` for web apps to unblock OAuth integrations that are not strictly conform OpenID Connect.

  when it's enabled, Refresh Tokens will be always issued regardless if `prompt=consent` was present in the authorization request.

## 1.2.4

### Patch Changes

- a65bc9b13: Should ignore empty number input box when parsing connector config form.

## 1.2.3

### Patch Changes

- 046a5771b: upgrade i18next series packages (#3733, #3743)

## 1.2.2

### Patch Changes

- 748878ce5: add React context and hook to app-insights, fix init issue for frontend projects

## 1.2.1

### Patch Changes

- 352807b16: support setting cloud role name for AppInsights in React

## 1.2.0

### Minor Changes

- c5eb3a2ba: support create user by multiple identifiers
- 5553425fc: support suspend user

### Patch Changes

- 6cbc90389: ensure all log keys present in the filter, remove deprecated log keys, fix log event filter
- 457cb2822: Adding social connectors will now mark the related get-started action item as completed.
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

## 1.1.0

### Patch Changes

- 484f08523: Fix connector config form's validation for "switch" field.

## 1.0.3

## 1.0.2

## 1.0.1

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

- 1c9160112: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

- f41fd3f05: drop settings table and add systems table

  **BREAKING CHANGES**

  - core: removed `GET /settings` and `PATCH /settings` API
  - core: added `GET /configs/admin-console` and `PATCH /configs/admin-console` API
    - `/configs/*` APIs are config/key-specific now. they may have different logic per key
  - cli: change valid `logto db config` keys by removing `alterationState` and adding `adminConsole` since:
    - OIDC configs and admin console configs are tenant-level configs (the concept of "tenant" can be ignored until we officially announce it)
    - alteration state is still a system-wide config

### Minor Changes

- 343b1090f: ### Add dynamic favicon and html title

  - Add the favicon field in the sign-in-experience branding settings. Users would be able to upload their own favicon. Use local logto icon as a fallback

  - Set different html title for different pages.
    - sign-in
    - register
    - forgot-password
    - logto

- c12717412: ## Creating your social connector with ease

  We’re excited to announce that Logto now supports standard protocols (SAML, OIDC, and OAuth2.0) for creating social connectors to integrate external identity providers. Each protocol can create multiple social connectors, giving you more control over your access needs.

  To simplify the process of configuring social connectors, we’re replacing code-edit with simple forms. SAML already supports form configuration, with other connectors coming soon. This means you don’t need to compare documents or worry about code format.

- 343b1090f: - Automatically create a new tenant for new cloud users
  - Support path-based multi-tenancy
- 343b1090f: Allow admin tenant admin to create tenants without limitation
- 343b1090f: ### Add privacy policy url

  In addition to the terms of service url, we also provide a privacy policy url field in the sign-in-experience settings. To better support the end-users' privacy declaration needs.

- 343b1090f: New feature: User account settings page

  - We have removed the previous settings page and moved it to the account settings page. You can access to the new settings menu by clicking the user avatar in the top right corner.
  - You can directly change the language or theme from the popover menu, and explore more account settings by clicking the "Profile" menu item.
  - You can update your avatar, name and username in the profile page, and also changing your password.
  - [Cloud] Cloud users can also link their email address and social accounts (Google and GitHub at first launch).

- 343b1090f: remove the branding style config and make the logo URL config optional
- 343b1090f: Add custom CSS code editor so that users can apply advanced UI customization.
  - Users can check the real time preview of the CSS via SIE preview on the right side.
- 2168936b9: **Sign-in Experience v2**

  We are thrilled to announce the release of the newest version of the Sign-in Experience, which includes more ways to sign-in and sign-up, as well as a framework that is easier to understand and more flexible to configure in the Admin Console.

  When compared to Sign-in Experience v1, this version’s capability was expanded so that it could support a greater variety of flexible use cases. For example, now users can sign up with email verification code and sign in with email and password.

  We hope that this will be able to assist developers in delivering a successful sign-in flow, which will also be appreciated by the end users.

- f41fd3f05: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.

### Patch Changes

- 343b1090f: ## Refactor the Admin Console 403 flow

  - Add 403 error handler for all AC API requests
  - Show confirm modal to notify the user who is not authorized
  - Click `confirm` button to sign out and redirect user to the sign-in page

- 343b1090f: add deletion confirm for in-used passwordless connectors
- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.
- 343b1090f: **Seed data for cloud**

  - cli!: remove `oidc` option for `database seed` command as it's unused
  - cli: add hidden `--cloud` option for `database seed` command to init cloud data
  - cli, cloud: appending Redirect URIs to Admin Console will deduplicate values before update
  - move `UrlSet` and `GlobalValues` to `@logto/shared`

- 1c9160112: Various UI improvements

## 1.0.0-rc.3

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

- c12717412: ## Creating your social connector with ease

  We’re excited to announce that Logto now supports standard protocols (SAML, OIDC, and OAuth2.0) for creating social connectors to integrate external identity providers. Each protocol can create multiple social connectors, giving you more control over your access needs.

  To simplify the process of configuring social connectors, we’re replacing code-edit with simple forms. SAML already supports form configuration, with other connectors coming soon. This means you don’t need to compare documents or worry about code format.

## 1.0.0-rc.1

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

- f41fd3f0: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.

## 1.0.0-beta.19

## 1.0.0-beta.18

### Major Changes

- 1c916011: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

### Patch Changes

- 1c916011: Various UI improvements

## 1.0.0-beta.17

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.

## 1.0.0-beta.15

## 1.0.0-beta.14

## 1.0.0-beta.13

### Minor Changes

- 2168936b: **Sign-in Experience v2**

  We are thrilled to announce the release of the newest version of the Sign-in Experience, which includes more ways to sign-in and sign-up, as well as a framework that is easier to understand and more flexible to configure in the Admin Console.

  When compared to Sign-in Experience v1, this version’s capability was expanded so that it could support a greater variety of flexible use cases. For example, now users can sign up with email verification code and sign in with email and password.

  We hope that this will be able to assist developers in delivering a successful sign-in flow, which will also be appreciated by the end users.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

**Note:** Version bump only for package @logto/console

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

### Features

- add vertical center support ([#2032](https://github.com/logto-io/logto/issues/2032)) ([5eeb06e](https://github.com/logto-io/logto/commit/5eeb06e301b06d3caad65ece1b7b05cf6e160dd4))
- **console:** add a11y lint to ac ([#2066](https://github.com/logto-io/logto/issues/2066)) ([37d2b0c](https://github.com/logto-io/logto/commit/37d2b0ce5c09658d5e49be84b891d9a0d83f6f5c))
- **console:** add custom language ([#2029](https://github.com/logto-io/logto/issues/2029)) ([800ac7f](https://github.com/logto-io/logto/commit/800ac7fcd9592875df29d897e3a704fc6a73fee1))
- **console:** auto detect language setting ([#1941](https://github.com/logto-io/logto/issues/1941)) ([cdfaf8b](https://github.com/logto-io/logto/commit/cdfaf8b1c7fd268f205e4679cfc762d7e3eedfea))
- **console:** delete custom phrases ([#2065](https://github.com/logto-io/logto/issues/2065)) ([68e8884](https://github.com/logto-io/logto/commit/68e88840bfe4f50682c028188f32bc2480e8d8d7))
- **console:** display unsaved alert on custom phrases changed ([#1994](https://github.com/logto-io/logto/issues/1994)) ([0679a6a](https://github.com/logto-io/logto/commit/0679a6a67c71203e0bae3489768184a6e564937d))
- **console:** manage language ([#1981](https://github.com/logto-io/logto/issues/1981)) ([48832e5](https://github.com/logto-io/logto/commit/48832e50548421b876deaf10b1d3379674e7f562))

### Bug Fixes

- add redirectURI validation on frontend & backend ([#1874](https://github.com/logto-io/logto/issues/1874)) ([4b0970b](https://github.com/logto-io/logto/commit/4b0970b6d8c6647a6e68bf27fe3db3aeb635768e))
- **console:** checkbox styles ([7c85e50](https://github.com/logto-io/logto/commit/7c85e50c4597f6ed0a19384916ea6ef1bb3974a5))
- **console:** clear select state on close modal ([#2071](https://github.com/logto-io/logto/issues/2071)) ([b6b9d7c](https://github.com/logto-io/logto/commit/b6b9d7ce80aefe7341b3167e18ce4af291052015))
- **console:** language editor form should be dirty on clear button clicked ([#2037](https://github.com/logto-io/logto/issues/2037)) ([1223d23](https://github.com/logto-io/logto/commit/1223d23eb3f13cce707f6cd5eecd043c476f3514))
- **console:** remove connector id and prevent text overflow ([#2072](https://github.com/logto-io/logto/issues/2072)) ([05b5025](https://github.com/logto-io/logto/commit/05b50250a387635649614aaeeec9757e7034a19d))
- **console:** responsive modal items layout ([#2160](https://github.com/logto-io/logto/issues/2160)) ([ac38a7f](https://github.com/logto-io/logto/commit/ac38a7f3ac13b90ffb2ea8a94d40a390d652a62b))
- **console:** save generated password in session storage ([#2116](https://github.com/logto-io/logto/issues/2116)) ([8a7f875](https://github.com/logto-io/logto/commit/8a7f875767f5d70edc41509ddd1973b87ad16ee9))
- **console:** set undefined value to empty string in custom phrases ([#2074](https://github.com/logto-io/logto/issues/2074)) ([81f9fbc](https://github.com/logto-io/logto/commit/81f9fbc48379afc7de5d84e3614097ee37a1424b))
- **console:** show correct password after reset ([#2063](https://github.com/logto-io/logto/issues/2063)) ([02c082c](https://github.com/logto-io/logto/commit/02c082cb71258a931925df87126060fa9d9a2c5d))
- **console:** use fallback language in preview ([#1960](https://github.com/logto-io/logto/issues/1960)) ([f25ae4d](https://github.com/logto-io/logto/commit/f25ae4de1477feca5a8e077cb05146bb13719e6f))

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### ⚠ BREAKING CHANGES

- **core:** update user scopes (#1922)

### Features

- **console:** auto detect language setting ([#1941](https://github.com/logto-io/logto/issues/1941)) ([49b4303](https://github.com/logto-io/logto/commit/49b430394dc961451a6abca26a95ebba8d22f68c))
- **console:** configure M2M app access ([#1999](https://github.com/logto-io/logto/issues/1999)) ([a75f8fe](https://github.com/logto-io/logto/commit/a75f8fe959b5a0b0f670bcec83b072e4d41c7890))
- **core:** machine to machine apps ([cd9c697](https://github.com/logto-io/logto/commit/cd9c6978a35d9fc3a571c7bd56c972939c49a9b5))

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))
- **console:** add sandbox attribute to iframe ([#1926](https://github.com/logto-io/logto/issues/1926)) ([14cb043](https://github.com/logto-io/logto/commit/14cb0439e3b7a346e6d6e1a707cdea2e7d79df52))
- **console:** get prefixed router basename in local dev env ([ccbe5da](https://github.com/logto-io/logto/commit/ccbe5dab2d60974e9c893925d552b5fc93542490))
- **console:** old value does not flash back on saving form ([cdbd8d7](https://github.com/logto-io/logto/commit/cdbd8d7344ad22bfc10219f732e718f437cb0668))
- **console:** use fallback language in preview ([#1960](https://github.com/logto-io/logto/issues/1960)) ([de4c46e](https://github.com/logto-io/logto/commit/de4c46e400bb4c3f3552a984366ec99b7032ed18))

### Reverts

- Revert "feat(console): auto detect language setting (#1941)" (#2004) ([ad1d1e3](https://github.com/logto-io/logto/commit/ad1d1e3b592b106b3cea4703d19bab041a9d48db)), closes [#1941](https://github.com/logto-io/logto/issues/1941) [#2004](https://github.com/logto-io/logto/issues/2004)
- Revert "fix(console): use fallback language in preview (#1960)" (#2003) ([fa98452](https://github.com/logto-io/logto/commit/fa98452fe5c5e77964289df704a578e93cba877b)), closes [#1960](https://github.com/logto-io/logto/issues/1960) [#2003](https://github.com/logto-io/logto/issues/2003)

### Code Refactoring

- **core:** update user scopes ([#1922](https://github.com/logto-io/logto/issues/1922)) ([8d22b5c](https://github.com/logto-io/logto/commit/8d22b5c468e5148a3815abf93de14644cdf68e8e))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### Features

- **console:** press tab to insert 2 spaces in code editor ([#1871](https://github.com/logto-io/logto/issues/1871)) ([c57228c](https://github.com/logto-io/logto/commit/c57228c2ecc5f538f3f4761efd8cbd57e2d49eb7))

### Bug Fixes

- **console,ui:** fix locale guard issue in settings page ([e200578](https://github.com/logto-io/logto/commit/e2005780a39fa7b5f5c5e406f37805913b684c18))
- **console:** input invalid format content in multitextinput will not crash the app ([035be48](https://github.com/logto-io/logto/commit/035be481cc743d22105cecaf1d746456cd2d9956))
- downgrade to sdk 1.0.0-beta.2 ([#1896](https://github.com/logto-io/logto/issues/1896)) ([91d1bf8](https://github.com/logto-io/logto/commit/91d1bf8004165e3ab42dfd705046ef7f3bd612d9))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/console

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

### Features

- **console:** allow to disable create account ([#1806](https://github.com/logto-io/logto/issues/1806)) ([67305ec](https://github.com/logto-io/logto/commit/67305ec407d8a5ea1956e37df6dae2bdff012c06))
- **console:** express integration guide ([#1807](https://github.com/logto-io/logto/issues/1807)) ([8e4ef2f](https://github.com/logto-io/logto/commit/8e4ef2ff25641d377cca9d0a2e16791dff8aee22))

### Bug Fixes

- **console:** change step title to sentence case ([#1814](https://github.com/logto-io/logto/issues/1814)) ([82cd315](https://github.com/logto-io/logto/commit/82cd31545d0485ac59857904aa681c4a15eace38))

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

### ⚠ BREAKING CHANGES

- **core,console:** remove `/me` apis (#1781)

### Bug Fixes

- **console:** show platform icons in connector table ([#1792](https://github.com/logto-io/logto/issues/1792)) ([31f2439](https://github.com/logto-io/logto/commit/31f243957c83004dbc8578ab8931a2bc10c537b4))

### Code Refactoring

- **core,console:** remove `/me` apis ([#1781](https://github.com/logto-io/logto/issues/1781)) ([2c6171c](https://github.com/logto-io/logto/commit/2c6171c2f97b5122c13dd959f507399b9a9d6aa4))

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

### Features

- **console:** add app secret to guide ([#1735](https://github.com/logto-io/logto/issues/1735)) ([380e258](https://github.com/logto-io/logto/commit/380e2581fa5fdd2a8d4c76f45cd114b1ddea9891))
- **console:** show app secret ([#1723](https://github.com/logto-io/logto/issues/1723)) ([01dfeed](https://github.com/logto-io/logto/commit/01dfeed19b05219c1ab52790b3e98a029af02f90))

### Bug Fixes

- build and types ([8b51543](https://github.com/logto-io/logto/commit/8b515435cdb0644d0ca19e2c26ba3e744355bb0b))
- **ui,console,demo-app:** update react render method ([#1750](https://github.com/logto-io/logto/issues/1750)) ([4b972f2](https://github.com/logto-io/logto/commit/4b972f2e23e2d4609d9955c4d1d42972f368f5b9))

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Features

- **console:** add Next.js integration guide in admin console ([7d3f947](https://github.com/logto-io/logto/commit/7d3f94738f495de98464d23b6fdf18214d59005e))
- **console:** checked if sign in method is primary ([#1706](https://github.com/logto-io/logto/issues/1706)) ([405791f](https://github.com/logto-io/logto/commit/405791f9910ae9f11cf34d346b0b34fcba3a2aad))
- **phrases:** tr language ([#1707](https://github.com/logto-io/logto/issues/1707)) ([411a8c2](https://github.com/logto-io/logto/commit/411a8c2fa2bfb16c4fef5f0a55c3c1dc5ead1124))

### Bug Fixes

- **console:** app error illustration height should not be shrunk ([301cc6c](https://github.com/logto-io/logto/commit/301cc6c51031d4042337583866c7c4814b730809))
- **console:** should not display unsaved changes alert on connector config updated ([#1685](https://github.com/logto-io/logto/issues/1685)) ([61b65a7](https://github.com/logto-io/logto/commit/61b65a7288bcba0a139c917125b58ac3258ef3ad))

### Reverts

- Revert "feat(console): checked if sign in method is primary" (#1712) ([2229dce](https://github.com/logto-io/logto/commit/2229dce36ea79bb04cf29c39bdb70b22f1430510)), closes [#1712](https://github.com/logto-io/logto/issues/1712) [#1706](https://github.com/logto-io/logto/issues/1706)

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

### Bug Fixes

- **console:** code editor content should be editable on firefox ([56ded3e](https://github.com/logto-io/logto/commit/56ded3e0a970bf5d05b675dc7306be22a7e6316c))
- **console:** connector can be dragged upwards to reorder ([038bba4](https://github.com/logto-io/logto/commit/038bba45e198536a00af0e010abd437151c26497))
- **console:** remove annoying horizontal scrollbar from code editor ([7dba908](https://github.com/logto-io/logto/commit/7dba9088492676e9ad257a280d5b615571f36167))
- **console:** should parse to json before using zod safeParse ([ec674ec](https://github.com/logto-io/logto/commit/ec674ecd7745beb3df2b651bfa98d5e8d4a62dfd))

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

### Features

- **console:** add a declaration file for `react-i18next` ([#1556](https://github.com/logto-io/logto/issues/1556)) ([6ae5e7d](https://github.com/logto-io/logto/commit/6ae5e7d9277e5dd77306fa790b95fb61110b7f44))
- **console:** update dashboard chart y-axis tick format ([#1590](https://github.com/logto-io/logto/issues/1590)) ([951c6fa](https://github.com/logto-io/logto/commit/951c6fa9a5499d554141abe55e57f2a9e1943736))

### Bug Fixes

- **console:** docs link doesn't work for en-US locale ([#1594](https://github.com/logto-io/logto/issues/1594)) ([78fcb03](https://github.com/logto-io/logto/commit/78fcb038ed9b4c356774eacc2d23dfd6d71e63ca))
- **console:** external links in readme should be opened in new tab ([23ff0bf](https://github.com/logto-io/logto/commit/23ff0bf21d7ae77b9856d1f2c3e2ad3f2f4baa23))
- **console:** language select box initial value should not be empty ([26f47d8](https://github.com/logto-io/logto/commit/26f47d873ddd259451fd54f9c3bff5dd7cf849d1))
- **console:** navigate to new connector details page after switching connector ([1615e36](https://github.com/logto-io/logto/commit/1615e36f37496acd9c1976aa2f8a3b022cea8fde))

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

### Bug Fixes

- **console:** markdown toc links that contain special characters should work ([#1543](https://github.com/logto-io/logto/issues/1543)) ([1b056f1](https://github.com/logto-io/logto/commit/1b056f125d5a85275d0a3071d06e31a71c89de78))
- **console:** redirect uri field label should display properly in guide ([#1549](https://github.com/logto-io/logto/issues/1549)) ([020f294](https://github.com/logto-io/logto/commit/020f294067835c333fe8f9dd1aa7e9798d48b731))
- **console:** should display user avatar through google connector ([e2f5263](https://github.com/logto-io/logto/commit/e2f52635c0b9854d4140ecf1df2f0422047790a5))
- **console:** should not display unsaved alert on item deleted ([#1507](https://github.com/logto-io/logto/issues/1507)) ([459af38](https://github.com/logto-io/logto/commit/459af3823c1c5b4ba8cbdc860e1a9fb731975fcc))
- **console:** should not display unsaved alert on settings updated ([#1508](https://github.com/logto-io/logto/issues/1508)) ([5dcdc62](https://github.com/logto-io/logto/commit/5dcdc62f73d9b0ad8e9fcbb3f10aa5816c5bc772))
- **console:** tooltip style ([#1517](https://github.com/logto-io/logto/issues/1517)) ([f387652](https://github.com/logto-io/logto/commit/f387652bfd55a7842ee3c97a3df12f085aaf6013))

## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)

### Features

- **console:** add placeholder for connector sender test ([#1476](https://github.com/logto-io/logto/issues/1476)) ([8e85a11](https://github.com/logto-io/logto/commit/8e85a115ec6fa009a53311553a5fc9e9d800c361))
- expose zod error ([#1474](https://github.com/logto-io/logto/issues/1474)) ([81b63f0](https://github.com/logto-io/logto/commit/81b63f07bb412abf1f2b42059bac2ffcfc86272c))

### Bug Fixes

- **console:** add unsaved changes warning in settings page ([2cdbf37](https://github.com/logto-io/logto/commit/2cdbf3774594b3078764bd6b0b837cfcdb081ba3))
- **console:** admin console language detection ([a8f18e5](https://github.com/logto-io/logto/commit/a8f18e53a297303953bf893b1e30f50c4c674b93))
- **console:** connector guide should not have sub title ([#1471](https://github.com/logto-io/logto/issues/1471)) ([8009d9b](https://github.com/logto-io/logto/commit/8009d9bd576ff413ad49833e0c615dd34f5bde85))
- **console:** connector placeholder icon should not have background color ([#1472](https://github.com/logto-io/logto/issues/1472)) ([130817f](https://github.com/logto-io/logto/commit/130817f1012ca21b92e58c49f417f95976f913db))
- **console:** do not show unsaved alert after delete connector ([#1496](https://github.com/logto-io/logto/issues/1496)) ([61a6b1a](https://github.com/logto-io/logto/commit/61a6b1ab4feba88d3175e60d7cf6ba13debe4d5f))
- **console:** docs link in get-started should be localized ([#1482](https://github.com/logto-io/logto/issues/1482)) ([800f047](https://github.com/logto-io/logto/commit/800f04744daec154223f3d94e5d169e2c47bf291))
- **console:** hide demo-app from topbar get-started progress if it is deleted ([b0bdd90](https://github.com/logto-io/logto/commit/b0bdd9027b85bdb00e496e7a139d6c37bb60ae24))
- **console:** hide single platform universal connector tab ([3d944a5](https://github.com/logto-io/logto/commit/3d944a518b1f96753ed5312bfda486a5da814dd2))
- **console:** hide the add connectors hint when no connectors found on sign-in-experience page ([#1473](https://github.com/logto-io/logto/issues/1473)) ([d309400](https://github.com/logto-io/logto/commit/d3094005f12b9a9f3c9e12a6ec06fa60646ffb69))
- **console:** improve error handling in connector details and sender tester ([d9ce4a0](https://github.com/logto-io/logto/commit/d9ce4a01542da0d8ca5fc45a5086314d28e8f4da))
- **console:** mutate after connector delete ([#1475](https://github.com/logto-io/logto/issues/1475)) ([da882ce](https://github.com/logto-io/logto/commit/da882cee85461899ff32e6db2a07943830e41512))
- **console:** pagination color should be color-text-link ([#1466](https://github.com/logto-io/logto/issues/1466)) ([481b6a0](https://github.com/logto-io/logto/commit/481b6a05583891572bd405baefc9f44dabfb2942))
- **console:** provide fallback value for language field in settings ([5ad5eb2](https://github.com/logto-io/logto/commit/5ad5eb2ad9ef0cabefb6386ca1d84456f17dc547))
- **console:** remove session doc link ([#1479](https://github.com/logto-io/logto/issues/1479)) ([bb790ce](https://github.com/logto-io/logto/commit/bb790ce4d1c552dd6392a0fedb29c655aa41c979))
- **console:** set language in request header ([#1485](https://github.com/logto-io/logto/issues/1485)) ([f2195dd](https://github.com/logto-io/logto/commit/f2195dd8f314b766c6a47bdc094061f695c59b89))
- **console:** specify toast type ([#1499](https://github.com/logto-io/logto/issues/1499)) ([bdbeee0](https://github.com/logto-io/logto/commit/bdbeee0db58834b2c9633ef8a75accedfa3a7f0f))

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

### Features

- **console:** open docs on documentation tab clicked ([#1444](https://github.com/logto-io/logto/issues/1444)) ([340c641](https://github.com/logto-io/logto/commit/340c641f4e135077b90ad83c291d380d930aacf8))

### Bug Fixes

- **console:** language auto detection ([7c880fc](https://github.com/logto-io/logto/commit/7c880fc3e6c45dca11e59f1bb4d4623cf2415255))
- **console:** mutate data after sie welcome done ([#1447](https://github.com/logto-io/logto/issues/1447)) ([33106aa](https://github.com/logto-io/logto/commit/33106aac93fdb87579dcc178e034360decca9a4f))
- **console:** set user select to none for link button ([#1446](https://github.com/logto-io/logto/issues/1446)) ([d293de0](https://github.com/logto-io/logto/commit/d293de0d031821b0ea9aa388eb599bfafb8a23c0))
- **console:** vanilla sdk integration guide ([58fe92e](https://github.com/logto-io/logto/commit/58fe92e914dd1e5e52ff3942123299eefde56cd0))

## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)

### Features

- **console:** add unsaved changes alert for connector config ([#1414](https://github.com/logto-io/logto/issues/1414)) ([78407fc](https://github.com/logto-io/logto/commit/78407fc6c9d8a18d8253e0052c63ea1dd63de576))
- **console:** user settings unsaved changes alert ([#1411](https://github.com/logto-io/logto/issues/1411)) ([14b27b6](https://github.com/logto-io/logto/commit/14b27b6d0de226518ad1e31dd117c1a567e05015))

### Bug Fixes

- **console:** chagne user added modal button to done ([#1438](https://github.com/logto-io/logto/issues/1438)) ([ec82507](https://github.com/logto-io/logto/commit/ec82507ca1107154676599afe16491e382a1d524))
- **console:** dashboard chart yaxios width ([#1435](https://github.com/logto-io/logto/issues/1435)) ([b26fb0c](https://github.com/logto-io/logto/commit/b26fb0c0c32e7bf2e361acd5e71cf20740bba25b))
- **console:** fix typo for variant ([#1423](https://github.com/logto-io/logto/issues/1423)) ([f6be19e](https://github.com/logto-io/logto/commit/f6be19e1e321eafd5672b88c6e7f54976032d673))
- **console:** use icon button in copytoclipboard ([#1440](https://github.com/logto-io/logto/issues/1440)) ([f8a9743](https://github.com/logto-io/logto/commit/f8a9743b2ea978fa2802ac8da4f51f7801d3a87a))
- **ui:** set ui specific i18n storage key ([#1441](https://github.com/logto-io/logto/issues/1441)) ([5b121d7](https://github.com/logto-io/logto/commit/5b121d78551d471125737daf31d4e0505e69e409))

## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)

### Features

- **console:** unsaved changes alert ([#1409](https://github.com/logto-io/logto/issues/1409)) ([098367e](https://github.com/logto-io/logto/commit/098367e1a380d81261e056f222131f34fb6e10c5))

### Bug Fixes

- **console:** dashbaord chart grid color ([#1417](https://github.com/logto-io/logto/issues/1417)) ([1d5f69d](https://github.com/logto-io/logto/commit/1d5f69db127a939f4c893f27230a96f6acb67f6e))
- **console:** leave page button should be primary on unsaved changes alert modal ([#1421](https://github.com/logto-io/logto/issues/1421)) ([be004fa](https://github.com/logto-io/logto/commit/be004fa4dab3c61b8396194c7604641ab2d82aad))

## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)

### Features

- **console:** update task complete icon ([#1395](https://github.com/logto-io/logto/issues/1395)) ([06f190b](https://github.com/logto-io/logto/commit/06f190b2c48acfc853c9f675bf918c43c17f800a))

### Bug Fixes

- **console:** disable secondary should remove sign in methods ([#1384](https://github.com/logto-io/logto/issues/1384)) ([6e3c461](https://github.com/logto-io/logto/commit/6e3c461a88c2ae39089fcf2df26ee06a139381a0))
- **console:** hide reset description on dark-mode primary color matched ([#1394](https://github.com/logto-io/logto/issues/1394)) ([de8f476](https://github.com/logto-io/logto/commit/de8f476b372134cf23dd01a1c7872b16bbc5e5c4))
- **console:** remove userinfo endpoint on application details page ([#1391](https://github.com/logto-io/logto/issues/1391)) ([a837d79](https://github.com/logto-io/logto/commit/a837d793d0e7bc9818013ba0adc2f8c03e4fab21))
- **console:** save sie when secondary method is disabled ([#1410](https://github.com/logto-io/logto/issues/1410)) ([52fee4c](https://github.com/logto-io/logto/commit/52fee4c4226c1fbc3d906f12dd2613200e56595f))
- **console:** use png for calendar icon ([#1385](https://github.com/logto-io/logto/issues/1385)) ([f01390a](https://github.com/logto-io/logto/commit/f01390a7b2f103f0ab7ec0817ea6e2e267390923))

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/console

### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/console

### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)

### Features

- **console:** add traditional web guide - express js demo ([60c9ceb](https://github.com/logto-io/logto/commit/60c9ceb085a969195eb16e021870972cb70fd4b0))

### [0.1.2-alpha.2](https://github.com/logto-io/logto/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)

### Features

- **console:** add loading skeleton to sign in experience page ([76921f5](https://github.com/logto-io/logto/commit/76921f58b7fa17f2b4a34088ed9a0ab7e9d0d820))

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/console

### [0.1.2-alpha.0](https://github.com/logto-io/logto/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2022-07-02)

**Note:** Version bump only for package @logto/console

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **ac:** implement admin console welcome page ([#1139](https://github.com/logto-io/logto/issues/1139)) ([b42f4ba](https://github.com/logto-io/logto/commit/b42f4ba1ff11c769efece9f5cea75014924516fc))
- **connector:** apple ([#966](https://github.com/logto-io/logto/issues/966)) ([7400ed8](https://github.com/logto-io/logto/commit/7400ed8896fdceda6165a0540413efb4e3a47438))
- **console,core:** hide admin user ([#1182](https://github.com/logto-io/logto/issues/1182)) ([9194a6e](https://github.com/logto-io/logto/commit/9194a6ee547e2eb83ec106a834409c33644481e5))
- **console,ui:** generate dark mode color in console ([#1231](https://github.com/logto-io/logto/issues/1231)) ([f72b21d](https://github.com/logto-io/logto/commit/f72b21d1602ab0fb35ef3e7d84f6c8ebd7e18b08))
- **console:** add 404 page in admin console ([0d047fb](https://github.com/logto-io/logto/commit/0d047fbaf115f005615b5df06170e526283d9335))
- **console:** add app icon and api icon ([#830](https://github.com/logto-io/logto/issues/830)) ([373d349](https://github.com/logto-io/logto/commit/373d349db73be01fdbd653c917f7cf9f3817d4d5))
- **console:** add application column in user management ([#728](https://github.com/logto-io/logto/issues/728)) ([a035587](https://github.com/logto-io/logto/commit/a0355872c65bc0da27e57e25568fbe5dcc5b671b))
- **console:** add column lastSignIn in user management ([#679](https://github.com/logto-io/logto/issues/679)) ([a0b4b98](https://github.com/logto-io/logto/commit/a0b4b98c35ff08c2df0863e4bc2110386fc54aee))
- **console:** add comopnent alert ([#706](https://github.com/logto-io/logto/issues/706)) ([60920c2](https://github.com/logto-io/logto/commit/60920c28dd0ab5481138264a0961d674abaa613b))
- **console:** add date picker in dashboard ([#1085](https://github.com/logto-io/logto/issues/1085)) ([5a073ce](https://github.com/logto-io/logto/commit/5a073ceb60932cb4f998bf5f6e80792e63c6552d))
- **console:** add details summary component in guides ([693c4f0](https://github.com/logto-io/logto/commit/693c4f0422eb312190f2c7b0673e3ceaa8c41213))
- **console:** add drawer animation ([#760](https://github.com/logto-io/logto/issues/760)) ([dd8b767](https://github.com/logto-io/logto/commit/dd8b7671306b4f712eb56cee339cc38a0c7061fc))
- **console:** add integration guide for vue sdk ([423b1a9](https://github.com/logto-io/logto/commit/423b1a98b88b9342a52f8cce176b2a23208bf9f0))
- **console:** add integration guide for vue sdk ([4931923](https://github.com/logto-io/logto/commit/4931923e1c9f58c0da0eebad49f11cfb9c45d30a))
- **console:** add mobile web tab in preview ([#1214](https://github.com/logto-io/logto/issues/1214)) ([9b6fd4c](https://github.com/logto-io/logto/commit/9b6fd4c417f2ee53375e436c839b711c86403d58))
- **console:** add page loading skeleton to data table and detail pages ([9b8658d](https://github.com/logto-io/logto/commit/9b8658d9c1d0b916ac4bd00e0355018f3dafb864))
- **console:** add placeholders ([#1277](https://github.com/logto-io/logto/issues/1277)) ([c26ca08](https://github.com/logto-io/logto/commit/c26ca08fb1109a2f3dae53bc8a1db5d8d7f6f47f))
- **console:** add prevew in guide modal ([#839](https://github.com/logto-io/logto/issues/839)) ([002f839](https://github.com/logto-io/logto/commit/002f839e31c26733adb8865e6ed3be5464865799))
- **console:** add user dropdown and sign out button ([5a09e7d](https://github.com/logto-io/logto/commit/5a09e7d6aa0d74215b299ef95b94bc715392cb77))
- **console:** audit log filters ([#1004](https://github.com/logto-io/logto/issues/1004)) ([a0d562f](https://github.com/logto-io/logto/commit/a0d562f7f24e10481c269b761c9a2c152affd50e))
- **console:** audit log table ([#1000](https://github.com/logto-io/logto/issues/1000)) ([fdd12de](https://github.com/logto-io/logto/commit/fdd12de1cf39c36dd65dd9365ad343478718d112))
- **console:** autofocus in create modal ([#785](https://github.com/logto-io/logto/issues/785)) ([b8143ff](https://github.com/logto-io/logto/commit/b8143ff1a7d79af9c21f07ece1ed8f6436d18474))
- **console:** clear search results ([#1199](https://github.com/logto-io/logto/issues/1199)) ([a2de467](https://github.com/logto-io/logto/commit/a2de467873d4d92d52660b8095b831971402a8da))
- **console:** configure cors-allowed-origins ([#695](https://github.com/logto-io/logto/issues/695)) ([4a0577a](https://github.com/logto-io/logto/commit/4a0577accdb36e2b916b0e520b3352f6426b64c7))
- **console:** connector detail top card ([5288d6d](https://github.com/logto-io/logto/commit/5288d6d6f488077e4e9166a850f37c4283c93fe2))
- **console:** connector groups table ([#962](https://github.com/logto-io/logto/issues/962)) ([eb3f0cb](https://github.com/logto-io/logto/commit/eb3f0cbf5bb70bbab0e56e0f035f72594bfc555c))
- **console:** connector in use status ([#1012](https://github.com/logto-io/logto/issues/1012)) ([542d574](https://github.com/logto-io/logto/commit/542d57426fa8be1ccd98b6ab59ccac85e6d14a1b))
- **console:** connector logo and platform icon ([#892](https://github.com/logto-io/logto/issues/892)) ([97e6bdd](https://github.com/logto-io/logto/commit/97e6bdd8aacdf12dcf99a984d7b5bcd2f61f1530))
- **console:** connector warnings in sign in methods ([#710](https://github.com/logto-io/logto/issues/710)) ([cd03130](https://github.com/logto-io/logto/commit/cd0313065c777df3cf36373b31a2bb7e0e77cfe6))
- **console:** contact us icon and texts ([#836](https://github.com/logto-io/logto/issues/836)) ([c3785d8](https://github.com/logto-io/logto/commit/c3785d86cd6d377fbd5612e4b54529371dce19ee))
- **console:** dark logo ([#860](https://github.com/logto-io/logto/issues/860)) ([664a218](https://github.com/logto-io/logto/commit/664a2180a51b577fb517661cf0d7efb1374f3858))
- **console:** dashboard blocks and curve ([#1076](https://github.com/logto-io/logto/issues/1076)) ([c38fab8](https://github.com/logto-io/logto/commit/c38fab89e15203e6e2a7e95258c837598389c24b))
- **console:** dashboard skeleton ([#1077](https://github.com/logto-io/logto/issues/1077)) ([5afbe9d](https://github.com/logto-io/logto/commit/5afbe9d70b531ee54d043c543addf98f5bf0a114))
- **console:** disable existing connectors when adding ([#1018](https://github.com/logto-io/logto/issues/1018)) ([19380d0](https://github.com/logto-io/logto/commit/19380d08739d219169bda1e1e8c2bf9101bd0e67))
- **console:** disallow management api deletion and renaming ([#1233](https://github.com/logto-io/logto/issues/1233)) ([568b75d](https://github.com/logto-io/logto/commit/568b75dffc9ce8335aced31f1a207f958bf133cb))
- **console:** display topbar shadow while scrolling ([#1340](https://github.com/logto-io/logto/issues/1340)) ([b3774cd](https://github.com/logto-io/logto/commit/b3774cd43aa6141f06bf282c69e3cc419fa5b504))
- **console:** dynamic sign in methods form ([#666](https://github.com/logto-io/logto/issues/666)) ([5944ff0](https://github.com/logto-io/logto/commit/5944ff075eca5f47b949a6100049f42074891be1))
- **console:** error handling in dashboard ([#1090](https://github.com/logto-io/logto/issues/1090)) ([6d3857e](https://github.com/logto-io/logto/commit/6d3857ef3580e9faf1f3b8a8ff8303b48c04aea4))
- **console:** form field tooltip ([#786](https://github.com/logto-io/logto/issues/786)) ([1c7de47](https://github.com/logto-io/logto/commit/1c7de47a9326f326d5ec98fd9336037f5b75bf94))
- **console:** group connectors in add modal ([#1029](https://github.com/logto-io/logto/issues/1029)) ([fa420c9](https://github.com/logto-io/logto/commit/fa420c9fcb30450d1f0c8833bfe4febd031de5ba))
- **console:** hard code admin display name with username ([#1348](https://github.com/logto-io/logto/issues/1348)) ([496b17b](https://github.com/logto-io/logto/commit/496b17b5277b544230bba3e8a3782ffcc32e11d7))
- **console:** hide get-started page on clicking 'Hide this' button ([7fd42fd](https://github.com/logto-io/logto/commit/7fd42fdaa17217f8be6ea120e287ea243904977a))
- **console:** implement get started page ([9790767](https://github.com/logto-io/logto/commit/979076769a069a3f100f33ed4cec9445ee0e18f5))
- **console:** implement get-started progress indicator component ([ed9387b](https://github.com/logto-io/logto/commit/ed9387bdda69d611ef7328214be300e17fa47135))
- **console:** init dashboard ([#1006](https://github.com/logto-io/logto/issues/1006)) ([28e09b6](https://github.com/logto-io/logto/commit/28e09b699424bb129a964ad61440e230c8baff50))
- **console:** input error message ([#1050](https://github.com/logto-io/logto/issues/1050)) ([458602f](https://github.com/logto-io/logto/commit/458602fd649170faab915e5079c56eb85540cb8e))
- **console:** integrate admin console language settings ([048290b](https://github.com/logto-io/logto/commit/048290b49f5f4c08882b1c51a289d31b7f18b590))
- **console:** integrate dark mode settings ([a04f818](https://github.com/logto-io/logto/commit/a04f818ffb8627a5c3d594edb466d1b8e45e3015))
- **console:** log details page ([#1064](https://github.com/logto-io/logto/issues/1064)) ([0421195](https://github.com/logto-io/logto/commit/04211957e1222f9597c32afd2982258afa73fa31))
- **console:** multi-text-input delete reminder ([#752](https://github.com/logto-io/logto/issues/752)) ([04fc5d4](https://github.com/logto-io/logto/commit/04fc5d48e9329b8fd713295207271803b54bbf35))
- **console:** page skeleton animation mixin ([de97bb5](https://github.com/logto-io/logto/commit/de97bb53f5dab4be38d89b5b8d97a40c9c22d062))
- **console:** platform label in connectors table ([#1034](https://github.com/logto-io/logto/issues/1034)) ([96701bc](https://github.com/logto-io/logto/commit/96701bcb746f1ed1d1413139033998a95e668de9))
- **console:** preview device wrapper ([#896](https://github.com/logto-io/logto/issues/896)) ([540bf9c](https://github.com/logto-io/logto/commit/540bf9c0555c84b324895233b860f72c660997bd))
- **console:** reset user password ([#1266](https://github.com/logto-io/logto/issues/1266)) ([8c46ead](https://github.com/logto-io/logto/commit/8c46eada4be16fee3c7d6b5ec2786b3d9b214b00))
- **console:** show app guide in "Check Help Guide" drawer ([e3cab67](https://github.com/logto-io/logto/commit/e3cab6767012ad556bef7889e1540480a57cf946))
- **console:** sie form reorg ([#1218](https://github.com/logto-io/logto/issues/1218)) ([2c41334](https://github.com/logto-io/logto/commit/2c413341d1c515049faa130416f7a5e591d10e8a))
- **console:** sign in exp guide ([#755](https://github.com/logto-io/logto/issues/755)) ([bafd094](https://github.com/logto-io/logto/commit/bafd09474c68ca5539d676d2cbf06fa16e070edb))
- **console:** sign in experience preview ([#783](https://github.com/logto-io/logto/issues/783)) ([6ab54c9](https://github.com/logto-io/logto/commit/6ab54c968b38ce9d12f15ad2ec5615748b79d269))
- **console:** sign in experience setup others tab ([#662](https://github.com/logto-io/logto/issues/662)) ([875a31e](https://github.com/logto-io/logto/commit/875a31ec2ab129df13abf9036ead3922f786187e))
- **console:** sign in experience welcome page ([#746](https://github.com/logto-io/logto/issues/746)) ([d815d96](https://github.com/logto-io/logto/commit/d815d96f1f664ee0b700f6b2b1dfc36d87f1c2df))
- **console:** sign in methods change alert ([#701](https://github.com/logto-io/logto/issues/701)) ([a1ceea0](https://github.com/logto-io/logto/commit/a1ceea068542e46db3ed7f873f339edb3803ea3f))
- **console:** support dark logo for connectors ([#1226](https://github.com/logto-io/logto/issues/1226)) ([a8467fd](https://github.com/logto-io/logto/commit/a8467fd09389f8797f94f39f4a3d6c3dc55667fe))
- **console:** support persisting get-started progress in settings config ([43b2309](https://github.com/logto-io/logto/commit/43b2309c994b2eb8b1b8f1c12893eb66b5ce1d95))
- **console:** update connector icons ([#935](https://github.com/logto-io/logto/issues/935)) ([f01d113](https://github.com/logto-io/logto/commit/f01d11344534bc82df9cfc44d2c6287c36edd0fd))
- **console:** update pagination size and color ([#1153](https://github.com/logto-io/logto/issues/1153)) ([fdb8b24](https://github.com/logto-io/logto/commit/fdb8b246a3782c1b90e554c657452ce17629ad2f))
- **console:** update user management table row height and avatar size ([#1151](https://github.com/logto-io/logto/issues/1151)) ([b2b7f37](https://github.com/logto-io/logto/commit/b2b7f370a423bbff2148a75f120916d971ce5581))
- **console:** user connector delete confirmation ([#1165](https://github.com/logto-io/logto/issues/1165)) ([4905a5d](https://github.com/logto-io/logto/commit/4905a5d72f7007213a24dd64251ee26a53aabf6b))
- **console:** user icon ([#857](https://github.com/logto-io/logto/issues/857)) ([9f94f16](https://github.com/logto-io/logto/commit/9f94f16be730d147fc00c35725a90eda363b5995))
- **console:** user logs ([#1082](https://github.com/logto-io/logto/issues/1082)) ([c4a0d7a](https://github.com/logto-io/logto/commit/c4a0d7ae35b45410423da300fbee1d78e7c6ef6e))
- **core,connectors:** update Aliyun logo and add logo_dark to Apple, Github ([#1194](https://github.com/logto-io/logto/issues/1194)) ([98f8083](https://github.com/logto-io/logto/commit/98f808320b1c79c51f8bd6f49e35ca44363ea560))
- **core,console:** change admin user password ([#1268](https://github.com/logto-io/logto/issues/1268)) ([a4d0a94](https://github.com/logto-io/logto/commit/a4d0a940bdabb213866407afb6c064b6740ce593))
- **core,console:** connector platform tabs ([#887](https://github.com/logto-io/logto/issues/887)) ([65fb36c](https://github.com/logto-io/logto/commit/65fb36ce3fd021cd44aeff95c4a01e75fe1352e7))
- **core,console:** social connector targets ([#851](https://github.com/logto-io/logto/issues/851)) ([127664a](https://github.com/logto-io/logto/commit/127664a62f1b1c794569b7fe9d0bfceb7b97dc74))
- **core:** add welcome route ([#1080](https://github.com/logto-io/logto/issues/1080)) ([f6f562a](https://github.com/logto-io/logto/commit/f6f562a8ba2c67793246eded995285eb5b68c1c7))
- **core:** identities key should use target not connectorId ([#1115](https://github.com/logto-io/logto/issues/1115)) ([41e37a7](https://github.com/logto-io/logto/commit/41e37a79955ac4f6437c4e52c1cf3f74adaad811)), closes [#1134](https://github.com/logto-io/logto/issues/1134)
- **core:** serve connector logo ([#931](https://github.com/logto-io/logto/issues/931)) ([5b44b71](https://github.com/logto-io/logto/commit/5b44b7194ed4f98c6c2e77aae828a39b477b6010))
- **core:** update connector db schema ([#732](https://github.com/logto-io/logto/issues/732)) ([8e1533a](https://github.com/logto-io/logto/commit/8e1533a70267d459feea4e5174296b17bef84d48))
- **dashboard:** add tooltip to dashboard items ([#1089](https://github.com/logto-io/logto/issues/1089)) ([9dd73ac](https://github.com/logto-io/logto/commit/9dd73ac1420c71093ee2a4ea35dc7d622ef062de))
- **demo-app:** implement (part 2) ([85a055e](https://github.com/logto-io/logto/commit/85a055efa4358cfb69c0d74f7aeaeb0bade024af))
- **demo-app:** implementation ([#982](https://github.com/logto-io/logto/issues/982)) ([7f4f4f8](https://github.com/logto-io/logto/commit/7f4f4f84addf8a25c3d30f1ac3ceeef460afcf17))
- **demo-app:** implementation (3/3) ([#1021](https://github.com/logto-io/logto/issues/1021)) ([91e2f05](https://github.com/logto-io/logto/commit/91e2f055f2eb75ef8846b02d0d211adbbb898b41))
- remove target, platform from connector schema and add id to metadata ([#930](https://github.com/logto-io/logto/issues/930)) ([054b0f7](https://github.com/logto-io/logto/commit/054b0f7b6a6dfed66540042ea69b0721126fe695))
- **ui:** implement preview mode ([#852](https://github.com/logto-io/logto/issues/852)) ([ef19fb3](https://github.com/logto-io/logto/commit/ef19fb3d27a84509613b1f1d47819c06e9a6e9d1))
- update field check rules ([#854](https://github.com/logto-io/logto/issues/854)) ([85a407c](https://github.com/logto-io/logto/commit/85a407c5f6f76fed0513acd6fb41943413935b5a))
- use user level custom data to save preferences ([#1045](https://github.com/logto-io/logto/issues/1045)) ([f2b44b4](https://github.com/logto-io/logto/commit/f2b44b49f9763b365b0062000146fee2b8df72a9))

### Bug Fixes

- `lint:report` script ([#730](https://github.com/logto-io/logto/issues/730)) ([3b17324](https://github.com/logto-io/logto/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
- **ac:** fix ac text input ([#1023](https://github.com/logto-io/logto/issues/1023)) ([498b370](https://github.com/logto-io/logto/commit/498b3708efce31b5b320540d3267a130d948b4b8))
- **console,core:** only show enabled connectors in sign in methods ([#988](https://github.com/logto-io/logto/issues/988)) ([4768181](https://github.com/logto-io/logto/commit/4768181bf77261eb84a1c4cb903fa0a22765d837))
- **console:** add border and shadow to preview ([#957](https://github.com/logto-io/logto/issues/957)) ([5fc2c99](https://github.com/logto-io/logto/commit/5fc2c991a477e3ddb05f3a29b63ee95ae8232cef))
- **console:** add bottom color for connector logos ([#1186](https://github.com/logto-io/logto/issues/1186)) ([c5cebfc](https://github.com/logto-io/logto/commit/c5cebfc297397548109303b3a73223dd14ba1a7d))
- **console:** add code editor field label ([#1170](https://github.com/logto-io/logto/issues/1170)) ([9aab5ee](https://github.com/logto-io/logto/commit/9aab5eebf721fec2f3d57d87f7462e0fc728c114))
- **console:** add connector button in table empty state ([#1224](https://github.com/logto-io/logto/issues/1224)) ([1905fb5](https://github.com/logto-io/logto/commit/1905fb5718335712a96da6c09a9e6ae52bfbd34a))
- **console:** add hover state to hide guide button ([#1328](https://github.com/logto-io/logto/issues/1328)) ([323895a](https://github.com/logto-io/logto/commit/323895a2dcf8fd703c0ae551fa3394ec1297c2ae))
- **console:** add letter spacing for sign-in-experience title ([#1033](https://github.com/logto-io/logto/issues/1033)) ([cf4bd1b](https://github.com/logto-io/logto/commit/cf4bd1b999ebcdfb239e04a829422f5f70d5d693))
- **console:** add mobile platform preview description ([#1032](https://github.com/logto-io/logto/issues/1032)) ([6167e5c](https://github.com/logto-io/logto/commit/6167e5c28d564453b45ee48f41c3aa86381334a1))
- **console:** add sie preview nav margin ([#1275](https://github.com/logto-io/logto/issues/1275)) ([210ddce](https://github.com/logto-io/logto/commit/210ddcea67dcf78cf98440fa6c211bb9aa62546c))
- **console:** add toast message on save uri success in guide ([129ce0b](https://github.com/logto-io/logto/commit/129ce0b5681c4e8aea9d748ed95dbc679502699e))
- **console:** adding social connector should complete corresponding get-started task ([8797c2d](https://github.com/logto-io/logto/commit/8797c2d9d5de7f4a2f628aa3025586d976030682))
- **console:** adjust preview size ([#951](https://github.com/logto-io/logto/issues/951)) ([fa14589](https://github.com/logto-io/logto/commit/fa14589440d4aa083c9570f37823f37056fdf3ad))
- **console:** align added sign-in method with table head content ([#1028](https://github.com/logto-io/logto/issues/1028)) ([c084b44](https://github.com/logto-io/logto/commit/c084b442aea8707a7d8e70683da3d684e41251c6))
- **console:** align usage of customizeSignInExperience ([#837](https://github.com/logto-io/logto/issues/837)) ([808a676](https://github.com/logto-io/logto/commit/808a676da6239fa0471c65f9920bd9715bfe4c19))
- **console:** application icon size ([#1237](https://github.com/logto-io/logto/issues/1237)) ([86aec6c](https://github.com/logto-io/logto/commit/86aec6cdf3986ed3d6d661fc3f7c8d5521e1d27e))
- **console:** application integrate SDK guides ([b616e71](https://github.com/logto-io/logto/commit/b616e71a5f3009f9b984b48b7f082f4876d025c0))
- **console:** auto generate password ([#1133](https://github.com/logto-io/logto/issues/1133)) ([a424f1b](https://github.com/logto-io/logto/commit/a424f1b1d2fe2dc51b769d9d7aa1eb719b73523d))
- **console:** back to social connectors ([#889](https://github.com/logto-io/logto/issues/889)) ([8cf72d9](https://github.com/logto-io/logto/commit/8cf72d9d6ecb9ac88c7c20bcdf9d3d6650d23d17))
- **console:** bump react sdk to 0.1.13 to resolve sign in issue ([fb34cdc](https://github.com/logto-io/logto/commit/fb34cdc3793c3768e759c4e13a898716de22566c))
- **console:** button loading spinner position ([b41b8f1](https://github.com/logto-io/logto/commit/b41b8f1811fbedc57a48c705ca33075ba8607746))
- **console:** button space on the guide header ([#1317](https://github.com/logto-io/logto/issues/1317)) ([0e93792](https://github.com/logto-io/logto/commit/0e93792fe9cfa1943b565b1a23cf581a8185d32f))
- **console:** call settings API after user authentication ([3f25d4e](https://github.com/logto-io/logto/commit/3f25d4e6f65015e39fd756afd5cfb26b9fbd4a37))
- **console:** change account modal margin ([#1344](https://github.com/logto-io/logto/issues/1344)) ([f1a7cb3](https://github.com/logto-io/logto/commit/f1a7cb3afb2dc4031d1e3f282376fb10cba5644f))
- **console:** change checkbox to controlled comp ([#1235](https://github.com/logto-io/logto/issues/1235)) ([9a72a34](https://github.com/logto-io/logto/commit/9a72a34cef51b7105ebd0e7ea9da875991a7a939))
- **console:** checkbox style ([#1327](https://github.com/logto-io/logto/issues/1327)) ([2f3c9ae](https://github.com/logto-io/logto/commit/2f3c9ae4fd9f28177466cb89589195c3aa4d6a75))
- **console:** clear error message before saving connector config ([#1273](https://github.com/logto-io/logto/issues/1273)) ([da48784](https://github.com/logto-io/logto/commit/da4878492fad8fcd90cc7e97943427c0ef12e724))
- **console:** connector card item style ([#1192](https://github.com/logto-io/logto/issues/1192)) ([ed3c93a](https://github.com/logto-io/logto/commit/ed3c93afdc303247d5ff71dc8b355f8b114a4b2c))
- **console:** connector details save changes footer ([#736](https://github.com/logto-io/logto/issues/736)) ([2d9b708](https://github.com/logto-io/logto/commit/2d9b7088a6f7f126b48eb2f395c255b7254b4b34))
- **console:** connector guide ([#990](https://github.com/logto-io/logto/issues/990)) ([3c37739](https://github.com/logto-io/logto/commit/3c37739107794466a30c44163743915d489bb3ae))
- **console:** connector guide setup content should scroll in the whole container ([#1314](https://github.com/logto-io/logto/issues/1314)) ([05399b5](https://github.com/logto-io/logto/commit/05399b5e594c0af591eadeb017af073cc9b9edcc))
- **console:** connector name in user detials ([#1147](https://github.com/logto-io/logto/issues/1147)) ([94084a4](https://github.com/logto-io/logto/commit/94084a49e77d964e4f9c230f88e3aa7d5e12179a))
- **console:** connector row clickable ([#1108](https://github.com/logto-io/logto/issues/1108)) ([2a4a61d](https://github.com/logto-io/logto/commit/2a4a61deabc827353ac7471565f25bb52d07fc1c))
- **console:** connector sender test loading state ([#1290](https://github.com/logto-io/logto/issues/1290)) ([7d47433](https://github.com/logto-io/logto/commit/7d47433cca2a8f6d3d11fb9a98c1b7c67d9710b2))
- **console:** contact us icons ([#1181](https://github.com/logto-io/logto/issues/1181)) ([e39704a](https://github.com/logto-io/logto/commit/e39704a8fa280201682f0e9e23d7b3f9d14e7d76))
- **console:** create connector form alignment ([#1220](https://github.com/logto-io/logto/issues/1220)) ([ebfab1d](https://github.com/logto-io/logto/commit/ebfab1d222be34a335478715c3cec38393e0af21))
- **console:** dashboard chart style ([#1177](https://github.com/logto-io/logto/issues/1177)) ([cf47044](https://github.com/logto-io/logto/commit/cf470446e4458e748bbf6384adb96d69805a1991)), closes [#1178](https://github.com/logto-io/logto/issues/1178)
- **console:** date picker input height ([#1171](https://github.com/logto-io/logto/issues/1171)) ([6ca1395](https://github.com/logto-io/logto/commit/6ca1395b8bf6e6b58c539b23fca2167ee3d47746))
- **console:** details page should not be shrinked ([#1338](https://github.com/logto-io/logto/issues/1338)) ([d73663a](https://github.com/logto-io/logto/commit/d73663af27a7a0f63d18e0015817aa5b5347cad9))
- **console:** display dark mode color setting only when dark mode is enabled ([#1027](https://github.com/logto-io/logto/issues/1027)) ([a506dc5](https://github.com/logto-io/logto/commit/a506dc5511e19bbf948ba96cab23489e2c55bbc3))
- **console:** display default avatar when the avatar is empty ([#1191](https://github.com/logto-io/logto/issues/1191)) ([71ed416](https://github.com/logto-io/logto/commit/71ed416bde2c03bc6808d0857f4e59725ad0015d))
- **console:** dropdown max height ([#1155](https://github.com/logto-io/logto/issues/1155)) ([402d19d](https://github.com/logto-io/logto/commit/402d19d5608fe695ae8c4f60172563b8f51511e1))
- **console:** dropdown padding ([#1168](https://github.com/logto-io/logto/issues/1168)) ([56d3f96](https://github.com/logto-io/logto/commit/56d3f96106c8f630bba327fe11b15dcc4719a423))
- **console:** error callstack content should not overflow container ([933950c](https://github.com/logto-io/logto/commit/933950cebf605195219dbf7f0c7a3405924bc9f6))
- **console:** error message in text input component ([#1060](https://github.com/logto-io/logto/issues/1060)) ([93916bf](https://github.com/logto-io/logto/commit/93916bfa5426f399b4cb8ceaca6bdfce5869c13e))
- **console:** fetch settings with swr on app init ([c7344c2](https://github.com/logto-io/logto/commit/c7344c2175164159978a499d1caa7e9f6808fac8))
- **console:** fix connector platform label i18n ([#1347](https://github.com/logto-io/logto/issues/1347)) ([b18388c](https://github.com/logto-io/logto/commit/b18388ce57f441b3c63b5441f90866bb09a28f80))
- **console:** fix dark mode char tooltip background ([#1345](https://github.com/logto-io/logto/issues/1345)) ([f6bf53b](https://github.com/logto-io/logto/commit/f6bf53bd8e639af62f00b465ca15bb947817e6e0))
- **console:** fix dashboard date ([#1274](https://github.com/logto-io/logto/issues/1274)) ([8c0ceff](https://github.com/logto-io/logto/commit/8c0ceff57480e5bf7a361b9c076fdf2ea6cb40eb))
- **console:** fix infinite loading issue when not authenticated ([32facc6](https://github.com/logto-io/logto/commit/32facc6e898213642c6753bc803349092f64d1d2))
- **console:** fix info icon vertical alignment ([#1106](https://github.com/logto-io/logto/issues/1106)) ([888c3d7](https://github.com/logto-io/logto/commit/888c3d767d0596ccb717789e3adf278d604ad88f))
- **console:** fix margin for SIE section ([#1212](https://github.com/logto-io/logto/issues/1212)) ([be56c75](https://github.com/logto-io/logto/commit/be56c75293e34b7ce08da1f8d294080ddcf3d81f))
- **console:** fix platform label prefix caused by merge ([#1049](https://github.com/logto-io/logto/issues/1049)) ([1dffcd2](https://github.com/logto-io/logto/commit/1dffcd2d09d32683f23aa8c4dd9f5f030567a5e7))
- **console:** fix SIE title padding ([#1211](https://github.com/logto-io/logto/issues/1211)) ([ca77a41](https://github.com/logto-io/logto/commit/ca77a41973b8719df3182304851fc6657d9063dd))
- **console:** get-started progress style ([#1343](https://github.com/logto-io/logto/issues/1343)) ([67a87bb](https://github.com/logto-io/logto/commit/67a87bb651d02af0c22e34f23c29c1f4f8cf2810))
- **console:** hide split line when username is empty ([#949](https://github.com/logto-io/logto/issues/949)) ([d8c8c04](https://github.com/logto-io/logto/commit/d8c8c041b980d7bb700b9b6043c62a1213bedc68))
- **console:** hide url input on terms of use disabled ([#1270](https://github.com/logto-io/logto/issues/1270)) ([1e6ad9f](https://github.com/logto-io/logto/commit/1e6ad9f15f0ce3de577033e1b59c2b25f460adec))
- **console:** hide user column ([#1296](https://github.com/logto-io/logto/issues/1296)) ([9b19b0e](https://github.com/logto-io/logto/commit/9b19b0e970b0c54d26b1ad59fe242672f6573f86))
- **console:** icon colors on the action menu ([#1179](https://github.com/logto-io/logto/issues/1179)) ([d71c18c](https://github.com/logto-io/logto/commit/d71c18c83c4065b28213ca93ae514a59879192de))
- **console:** icons in item preview should not be shrinked ([#1234](https://github.com/logto-io/logto/issues/1234)) ([2d66302](https://github.com/logto-io/logto/commit/2d663025ecbd08dc39878e2fd32cfb08b92e9b3a))
- **console:** improve horizontal scrollbar thumb styles ([818b1d7](https://github.com/logto-io/logto/commit/818b1d7cc78fb89060b23e3578b30fd20b6f2393))
- **console:** improve swr error handling to avoid app crash ([da77a1d](https://github.com/logto-io/logto/commit/da77a1d1b5c49f2e806bf0d5f27e326e081f1735))
- **console:** item preview alignment ([#1159](https://github.com/logto-io/logto/issues/1159)) ([5c43da2](https://github.com/logto-io/logto/commit/5c43da2201db8dbb4b782563fd37cad655326cad))
- **console:** jump to enabled connector ([#1225](https://github.com/logto-io/logto/issues/1225)) ([833436a](https://github.com/logto-io/logto/commit/833436ad157a8630d5839759644566df463fc80d))
- **console:** last button in guide should be primary type ([2036570](https://github.com/logto-io/logto/commit/2036570714a8fefa4dc959469f8fa9780ae312a5))
- **console:** limit preview options ([#1203](https://github.com/logto-io/logto/issues/1203)) ([4d16131](https://github.com/logto-io/logto/commit/4d16131b0cd62791ac62c5a274018eea3c9b1f9f))
- **console:** long text should wrap in code editor ([cbe2497](https://github.com/logto-io/logto/commit/cbe2497504322c81603317cbf2cc14f9ea45e103))
- **console:** misc improvements and ui fixes ([b653478](https://github.com/logto-io/logto/commit/b6534788416a4f837e2d13a9a6b6ecc2766f9a1b))
- **console:** move save changes into form ([#712](https://github.com/logto-io/logto/issues/712)) ([aed7442](https://github.com/logto-io/logto/commit/aed7442b32c3908d5ccdf14b096789564aba4bad))
- **console:** mutate settings after SIE guide done ([#1198](https://github.com/logto-io/logto/issues/1198)) ([ee2578b](https://github.com/logto-io/logto/commit/ee2578b6a1d7ab43f9076f301c114b04fedb4403))
- **console:** new platform tab colors ([#1158](https://github.com/logto-io/logto/issues/1158)) ([1bb770f](https://github.com/logto-io/logto/commit/1bb770fd1fa364f12c1c56a8542d36a3cf9647fe))
- **console:** new ui in save changes footer ([#661](https://github.com/logto-io/logto/issues/661)) ([19b9db8](https://github.com/logto-io/logto/commit/19b9db809ac5d66b935ee19dee0c2b83ebbf039a))
- **console:** only check demo app existence on get-started page ([e8ef4b6](https://github.com/logto-io/logto/commit/e8ef4b650ccc6db3d97b815f8c3d61db5a6c33f1))
- **console:** only show enabled connectors in table ([#1156](https://github.com/logto-io/logto/issues/1156)) ([4dbeb22](https://github.com/logto-io/logto/commit/4dbeb22fb6bbb901af3b62bb9fe7241dd9192426))
- **console:** open new tab for setup connectors ([#843](https://github.com/logto-io/logto/issues/843)) ([070a52c](https://github.com/logto-io/logto/commit/070a52c60abbebfdc42b9e9552096d1d27baae99))
- **console:** others form height in SIE ([#1210](https://github.com/logto-io/logto/issues/1210)) ([8d2f88b](https://github.com/logto-io/logto/commit/8d2f88b96d5814d31ac9871203e69bc640a44f1b))
- **console:** page content should not jump on scrollbar present ([#1306](https://github.com/logto-io/logto/issues/1306)) ([6d5a4f8](https://github.com/logto-io/logto/commit/6d5a4f8aebd3be882eab2bffb06b5947cb053c76))
- **console:** pass enabled connectors to preview ([#1209](https://github.com/logto-io/logto/issues/1209)) ([ac74309](https://github.com/logto-io/logto/commit/ac74309414c5509ab9a65b82b815487b99515328))
- **console:** prevent autofill background color ([#749](https://github.com/logto-io/logto/issues/749)) ([0f5491b](https://github.com/logto-io/logto/commit/0f5491b392418f7a1cd6418f15eef0176b0784d2))
- **console:** prevent cell overflow for user table ([#1215](https://github.com/logto-io/logto/issues/1215)) ([f5de519](https://github.com/logto-io/logto/commit/f5de5196fb24bfaf1c2bc304cedd7ac52fee49da))
- **console:** preview mobile device color ([#958](https://github.com/logto-io/logto/issues/958)) ([49b7908](https://github.com/logto-io/logto/commit/49b7908fb88420603af201afbc9c9b7ccc0feaeb))
- **console:** read-only text field background color should use color-layer-2 ([#1154](https://github.com/logto-io/logto/issues/1154)) ([ac99c26](https://github.com/logto-io/logto/commit/ac99c26181a013c449237b3c53e468330866cce9))
- **console:** reduce refresh frequency in preview ([#950](https://github.com/logto-io/logto/issues/950)) ([b61f70f](https://github.com/logto-io/logto/commit/b61f70fe01964fd1b9f0da6bbefc1cb099addf5c))
- **console:** reduce welcome image size ([#844](https://github.com/logto-io/logto/issues/844)) ([977b75b](https://github.com/logto-io/logto/commit/977b75b85822564de99674335e0dd23329817494))
- **console:** remove plain copytoclipboard padding ([#675](https://github.com/logto-io/logto/issues/675)) ([e7faf32](https://github.com/logto-io/logto/commit/e7faf32b5fdb2e05ae919b2f4346a4c76abda0a0))
- **console:** remove redundant `required` label ([#1030](https://github.com/logto-io/logto/issues/1030)) ([248e43d](https://github.com/logto-io/logto/commit/248e43d7c955163dd5d11170aa8b951edc368741))
- **console:** remove role edit from user details ([#1173](https://github.com/logto-io/logto/issues/1173)) ([520f66c](https://github.com/logto-io/logto/commit/520f66cf3cae3b4d03e4c71f70df526a47bbc111))
- **console:** remove sign in methods form fields in guilde ([#1174](https://github.com/logto-io/logto/issues/1174)) ([e0be4fe](https://github.com/logto-io/logto/commit/e0be4fed37fca22c8c7d8e9092b84e7c215aafc6))
- **console:** remove text input error state from delete form ([#1302](https://github.com/logto-io/logto/issues/1302)) ([9e67e59](https://github.com/logto-io/logto/commit/9e67e59ff5ebd1bff4b81101610bfd2532dea511))
- **console:** remove the close button from toast ([#1318](https://github.com/logto-io/logto/issues/1318)) ([40c8d0e](https://github.com/logto-io/logto/commit/40c8d0eeed558e73bb7d574ec92cf89e30b41d54))
- **console:** remove underline in the empty table ([#1180](https://github.com/logto-io/logto/issues/1180)) ([1704f57](https://github.com/logto-io/logto/commit/1704f57aad017c375967dde981091df1f234f3e7))
- **console:** remove unused api resource help button ([#1217](https://github.com/logto-io/logto/issues/1217)) ([e5249e2](https://github.com/logto-io/logto/commit/e5249e2f8cc373dec32a0db1f67e6f1d7a252271))
- **console:** reset password label ([#1300](https://github.com/logto-io/logto/issues/1300)) ([628ac46](https://github.com/logto-io/logto/commit/628ac46a892095bb4be458da5b9c50a8935205ea))
- **console:** resolve js warning reported in code editor component ([c5d1488](https://github.com/logto-io/logto/commit/c5d14887d4bec2d0b1cfd3c39a858f13ba2c647f))
- **console:** return to user-details page from user-log-details page ([#1135](https://github.com/logto-io/logto/issues/1135)) ([294c600](https://github.com/logto-io/logto/commit/294c60062e07d3a3f56a281e6a39a98aa3d92eb8))
- **console:** save changes button on settings page ([#1167](https://github.com/logto-io/logto/issues/1167)) ([97faade](https://github.com/logto-io/logto/commit/97faade141e070bac861700a488417231820233d))
- **console:** sdk selector content in the guide should be left-aligned ([#1316](https://github.com/logto-io/logto/issues/1316)) ([99cd56f](https://github.com/logto-io/logto/commit/99cd56f96357945e2fc118795ebf5811902ebfdf))
- **console:** select the old primary sign-in method when the primary method change ([#1062](https://github.com/logto-io/logto/issues/1062)) ([b2b7189](https://github.com/logto-io/logto/commit/b2b71898d3eb76b675669347cc4c5df7ea07c999))
- **console:** set input type in connector tester ([#1160](https://github.com/logto-io/logto/issues/1160)) ([25e94a4](https://github.com/logto-io/logto/commit/25e94a4359139f7cf4515ba606c325e6243db917))
- **console:** set preview desktop background color ([#1292](https://github.com/logto-io/logto/issues/1292)) ([a1726d5](https://github.com/logto-io/logto/commit/a1726d58b5f425b96ce25732a76bda1330f79a2e))
- **console:** set switch default value to false ([#1197](https://github.com/logto-io/logto/issues/1197)) ([f9f646c](https://github.com/logto-io/logto/commit/f9f646c42057a5535d8fb0a5eab48f70491d5151))
- **console:** should not append slash in cors allowed uri ([#1001](https://github.com/logto-io/logto/issues/1001)) ([826f368](https://github.com/logto-io/logto/commit/826f368768c1f98e5f7316dce3f90d9c945c987a))
- **console:** should return to previous page when on sign-in-experience and app details page ([#1137](https://github.com/logto-io/logto/issues/1137)) ([ae0caa8](https://github.com/logto-io/logto/commit/ae0caa8f8b38a6ca46164c26ee5ea9b7ad7bd8d3))
- **console:** show enabled platforms in detail tab ([#989](https://github.com/logto-io/logto/issues/989)) ([0656b6d](https://github.com/logto-io/logto/commit/0656b6d67d398e67253e2992d48273f3ebe314c1))
- **console:** show user id in users table ([#1269](https://github.com/logto-io/logto/issues/1269)) ([7d5dd1a](https://github.com/logto-io/logto/commit/7d5dd1a9c66d427d3019ef595a4ac95fb0da5119))
- **console:** sie guide skip ([#1271](https://github.com/logto-io/logto/issues/1271)) ([8dedd9d](https://github.com/logto-io/logto/commit/8dedd9dae17504908b9a00a80f5d2c8ecde322ad))
- **console:** sign in exp layout ([#1142](https://github.com/logto-io/logto/issues/1142)) ([3668b66](https://github.com/logto-io/logto/commit/3668b6640f593eafd6512de5b73354c1f836aae6))
- **console:** sms and email connector in use status ([#1161](https://github.com/logto-io/logto/issues/1161)) ([a868c1f](https://github.com/logto-io/logto/commit/a868c1ff63e8400c57b393262a70de1f83c54987))
- **console:** socialConnectors in preview data ([#862](https://github.com/logto-io/logto/issues/862)) ([a2cd983](https://github.com/logto-io/logto/commit/a2cd983d97097f86a07f988031b76665958ac24b))
- **console:** special application name for admin console ([#997](https://github.com/logto-io/logto/issues/997)) ([a0ff900](https://github.com/logto-io/logto/commit/a0ff90058ca90f624a5e3a97bce1bb6b64d02fb6))
- **console:** stop swr retry on error 401 and 403 ([db59e3c](https://github.com/logto-io/logto/commit/db59e3c6d73ada32f1f712cafff984d1e981efd0))
- **console:** text field style in settings ([#739](https://github.com/logto-io/logto/issues/739)) ([890028d](https://github.com/logto-io/logto/commit/890028d937d740e63fb23b8e2b81a1fa44b0731c))
- **console:** text input autofill styles ([e8a433d](https://github.com/logto-io/logto/commit/e8a433d1e58eadb84479f06d6d38fb0e8b648868))
- **console:** tip icon color ([#805](https://github.com/logto-io/logto/issues/805)) ([5b2fe32](https://github.com/logto-io/logto/commit/5b2fe3291949dfbbf83a706ff8bd4eeb0dcff005))
- **console:** tooltip vertical offset ([#1169](https://github.com/logto-io/logto/issues/1169)) ([99090e3](https://github.com/logto-io/logto/commit/99090e3144fbd07eb39960819cb92b98b3947298))
- **console:** typo ([#810](https://github.com/logto-io/logto/issues/810)) ([bc19a29](https://github.com/logto-io/logto/commit/bc19a298f82b4d8ee7c9dfd7382e21e22d3d48da))
- **console:** ui fixes ([#678](https://github.com/logto-io/logto/issues/678)) ([dc976d8](https://github.com/logto-io/logto/commit/dc976d8248032b7a6d47a45f709cd82711db37de))
- **console:** update get-started enable passwordless button text to "Enable" ([f7d2e4c](https://github.com/logto-io/logto/commit/f7d2e4cbd448356396788e127a8d8b6c03409387))
- **console:** update shadow styles ([#813](https://github.com/logto-io/logto/issues/813)) ([2e410e7](https://github.com/logto-io/logto/commit/2e410e7c168486db29909ef304dff63c2877a9a8))
- **console:** update terms of use ([#1122](https://github.com/logto-io/logto/issues/1122)) ([9262a6f](https://github.com/logto-io/logto/commit/9262a6f3beb7c2c46708453ce7d667dc5b39da8e))
- **console:** update user data ([#1184](https://github.com/logto-io/logto/issues/1184)) ([a3d3a79](https://github.com/logto-io/logto/commit/a3d3a79dd9c93c2bd23af78da1eb45de81642c3f))
- **console:** upgrade react-sdk 0.1.7 ([a814e2c](https://github.com/logto-io/logto/commit/a814e2c829b5219da2b8299f9e78aa2c13d123a8))
- **console:** use box shadow on radio group item hovered ([#1321](https://github.com/logto-io/logto/issues/1321)) ([953e7c6](https://github.com/logto-io/logto/commit/953e7c69777c96b3b32b0fe4e53de2fa2123c43b))
- **console:** use custom icon in date input ([#1172](https://github.com/logto-io/logto/issues/1172)) ([43711f2](https://github.com/logto-io/logto/commit/43711f234dfed94461272b0bd625a36886b5d73b))
- **console:** use native color picker style ([#819](https://github.com/logto-io/logto/issues/819)) ([628e025](https://github.com/logto-io/logto/commit/628e025a15d22bd11708f2dee8176d0f53ad8f2a))
- **console:** use small size dropdown in sign in experience preview ([#1083](https://github.com/logto-io/logto/issues/1083)) ([407bd6f](https://github.com/logto-io/logto/commit/407bd6f5bf1c70c7f7d87931008960d378757602))
- **console:** user connector table bottom line ([#1037](https://github.com/logto-io/logto/issues/1037)) ([f94a3f8](https://github.com/logto-io/logto/commit/f94a3f84c6cd14e2d36bc1d3a39d182beb5017ba))
- **console:** user connectors name ([#1164](https://github.com/logto-io/logto/issues/1164)) ([d36a7ab](https://github.com/logto-io/logto/commit/d36a7ab2420202b3a346e883d1aa9c939bf8e66b))
- **console:** user details card footer ([#1175](https://github.com/logto-io/logto/issues/1175)) ([7fb88f2](https://github.com/logto-io/logto/commit/7fb88f20fc58734fc4ce1a7ffdd8f53a0f0ba260))
- **console:** user management search result ([#1130](https://github.com/logto-io/logto/issues/1130)) ([3a814a6](https://github.com/logto-io/logto/commit/3a814a674633da8b250b62348025bb5d8d623bd4))
- **console:** wrap connector id with copytoclipboard ([#1025](https://github.com/logto-io/logto/issues/1025)) ([dfc51b6](https://github.com/logto-io/logto/commit/dfc51b6af757f0d9863a3de1d857fd81a5e6b28b))
- **console:** wrap routes with appcontent ([#1052](https://github.com/logto-io/logto/issues/1052)) ([88e2120](https://github.com/logto-io/logto/commit/88e2120e254e23fc150065be16519feb5ff08b27))
- **core,console:** delete specific user identities by target ([#1176](https://github.com/logto-io/logto/issues/1176)) ([ad86bc8](https://github.com/logto-io/logto/commit/ad86bc8e120e571268cffbb45fe3c8253c1207fe))
- delete custom domain ([#737](https://github.com/logto-io/logto/issues/737)) ([8a48fb6](https://github.com/logto-io/logto/commit/8a48fb6225f9850aeec7917a54d849fd9a88254e))
- revert "chore(deps): update parcel monorepo to v2.6.0" ([877bbc0](https://github.com/logto-io/logto/commit/877bbc0d2c5c0559a3fc9a8e801a13ebff2292a6))
- revert "refactor(console): handle user navigates to 'callback' after authenticated" ([8584680](https://github.com/logto-io/logto/commit/858468037c7e4db896b10cba228efe279f4c9c26))
