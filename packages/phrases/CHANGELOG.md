# Change Log

## 1.11.0

### Minor Changes

- 76fd33b7e: support default roles for users

### Patch Changes

- e04d9523a: replace the i18n translated hook event label with the hook event value directly in the console

  - remove all the legacy interaction hook events i18n phrases
  - replace the translated label with the hook event value directly in the console
    - `Create new account` -> `PostRegister`
    - `Sign in` -> `PostSignIn`
    - `Reset password` -> `PostResetPassword`

## 1.10.1

### Patch Changes

- 5b03030de: Not allow to modify management API resource through API.

  Previously, management API resource and its scopes are readonly in Console. But it was possible to modify through the API. This is not allowed anymore.

- 3486b12e8: Fix file upload API.

  The `koa-body` has been upgraded to the latest version, which caused the file upload API to break. This change fixes the issue.

  The `ctx.request.files.file` in the new version is an array, so the code has been updated to pick the first one.

## 1.10.0

### Minor Changes

- 5758f84f5: feat(console): support signing-key rotation
- cc01acbd0: Create a new user through API with password digest and corresponding algorithm

### Patch Changes

- 746483c49: api resource indicator must be a valid absolute uri

  An invalid indicator will make Console crash without this check.

  Note: We don't mark it as a breaking change as the api behavior has not changed, only adding the check on Console.

## 1.9.0

### Minor Changes

- 32df9acde: add all third-party related console, experience phrases

  - Add new i18n phrases for the third-party application management pages on the Admin Console.
  - Add new i18n phrases for the user consent page.
  - Add new i18n phrases for the user scopes as the description for all the Logto user claim scopes. Will be displayed on the user consent page.

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3
- 04ec78a91: improve error handling when user associated application is removed
- Updated dependencies [9089dbf84]
- Updated dependencies [31e60811d]
  - @logto/language-kit@1.1.0

## 1.8.0

### Minor Changes

- 9a7b19e49: Add single sign-in (SSO) related core phrases
- becf59169: introduce Logto Organizations

  The term "organization" is also used in other forms, such as "workspace", "team", "company", etc. In Logto, we use "organization" as the generic term to represent the concept of multi-tenancy.

  From now, you can create multiple organizations in Logto, each of which can have its own users, while in the same identity pool.

  Plus, we also introduce the concept of "organization template". It is a set of permissions and roles that applies to all organizations, while a user can have different roles in different organizations.

  See [🏢 Organizations (Multi-tenancy)](https://docs.logto.io/docs/recipes/organizations/) for more details.

## 1.7.0

### Minor Changes

- 6727f629d: feature: introduce multi-factor authentication

  We're excited to announce that Logto now supports multi-factor authentication (MFA) for your sign-in experience. Navigate to the "Multi-factor auth" tab to configure how you want to secure your users' accounts.

  In this release, we introduce the following MFA methods:

  - Authenticator app OTP: users can add any authenticator app that supports the TOTP standard, such as Google Authenticator, Duo, etc.
  - WebAuthn (Passkey): users can use the standard WebAuthn protocol to register a hardware security key, such as biometric keys, Yubikey, etc.
  - Backup codes：users can generate a set of backup codes to use when they don't have access to other MFA methods.

  For a smooth transition, we also support to configure the MFA policy to require MFA for sign-in experience, or to allow users to opt-in to MFA.

## 1.6.0

### Minor Changes

- 87df417d1: feat: support HTTP for webhook requests

## 1.5.0

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

## 1.4.1

### Patch Changes

- ecbecd8e4: various application improvements

  - Show OpenID Provider configuration endpoint in Console
  - Configure "Rotate Refresh Token" in Console
  - Configure "Refresh Token TTL" in Console

## 1.4.0

### Minor Changes

- 268dc50e7: Support setting default API Resource from Console and API

  - New API Resources will not be treated as default.
  - Added `PATCH /resources/:id/is-default` to setting `isDefault` for an API Resource.
    - Only one default API Resource is allowed per tenant. Setting one API default will reset all others.

- fa0dbafe8: Add custom domain support
- 497d5b526: Support updating sign-in identifiers in user details form
  - Admin can now update user sign-in identifiers (username, email, phone number) in the user details form in user management.
  - Other trivial improvements and fixes, e.g. input field placeholder, error handling, etc.

## 1.3.0

### Minor Changes

- 5d6720805: add config `alwaysIssueRefreshToken` for web apps to unblock OAuth integrations that are not strictly conform OpenID Connect.

  when it's enabled, Refresh Tokens will be always issued regardless if `prompt=consent` was present in the authorization request.

## 1.2.0

### Minor Changes

- ae6a54993: add it translation
- 206fba2b5: add pl-PL translation
- c5eb3a2ba: support create user by multiple identifiers
- 5553425fc: support suspend user

## 1.1.0

### Minor Changes

- f9ca7cc49: add ru translation
- 37714d153: add ja language
- f3d60a516: add es transaltion
- 5c50957a9: add zh-HK and zh-TW translation

### Patch Changes

- e9e8a6e11: update fr translation

## 1.0.0

### Major Changes

- 1c9160112: Packages are now ESM.

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

- 68f2d56a2: Add German language
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
- 1c9160112: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

### Patch Changes

- 343b1090f: add deletion confirm for in-used passwordless connectors
- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.

## 1.0.0-rc.1

### Minor Changes

- c12717412: ## Creating your social connector with ease

  We’re excited to announce that Logto now supports standard protocols (SAML, OIDC, and OAuth2.0) for creating social connectors to integrate external identity providers. Each protocol can create multiple social connectors, giving you more control over your access needs.

  To simplify the process of configuring social connectors, we’re replacing code-edit with simple forms. SAML already supports form configuration, with other connectors coming soon. This means you don’t need to compare documents or worry about code format.

## 1.0.0-beta.17

### Major Changes

- 1c916011: Packages are now ESM.

### Minor Changes

- 1c916011: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.

## 1.0.0-beta.13

### Minor Changes

- 68f2d56a: Add German language

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

### Bug Fixes

- make packages public ([e24fd04](https://github.com/logto-io/logto/commit/e24fd0479bc20c92bd38b5e214abe441404ce496))

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

### Features

- **console:** auto detect language setting ([#1941](https://github.com/logto-io/logto/issues/1941)) ([cdfaf8b](https://github.com/logto-io/logto/commit/cdfaf8b1c7fd268f205e4679cfc762d7e3eedfea))
- **console:** delete custom phrases ([#2065](https://github.com/logto-io/logto/issues/2065)) ([68e8884](https://github.com/logto-io/logto/commit/68e88840bfe4f50682c028188f32bc2480e8d8d7))
- **console:** display unsaved alert on custom phrases changed ([#1994](https://github.com/logto-io/logto/issues/1994)) ([0679a6a](https://github.com/logto-io/logto/commit/0679a6a67c71203e0bae3489768184a6e564937d))
- **console:** manage language ([#1981](https://github.com/logto-io/logto/issues/1981)) ([48832e5](https://github.com/logto-io/logto/commit/48832e50548421b876deaf10b1d3379674e7f562))

### Bug Fixes

- **deps:** update dependency @logto/language-kit to v1.0.0-beta.16 ([89e4800](https://github.com/logto-io/logto/commit/89e4800ca8e30cbf62a0000fa350ee2f5dd094de))

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### Features

- **console:** auto detect language setting ([#1941](https://github.com/logto-io/logto/issues/1941)) ([49b4303](https://github.com/logto-io/logto/commit/49b430394dc961451a6abca26a95ebba8d22f68c))
- **console:** configure M2M app access ([#1999](https://github.com/logto-io/logto/issues/1999)) ([a75f8fe](https://github.com/logto-io/logto/commit/a75f8fe959b5a0b0f670bcec83b072e4d41c7890))
- **core,phrases:** add check protected access function ([e405ef7](https://github.com/logto-io/logto/commit/e405ef7bb8fdbf01d52ef83b19350189e32a39b6))
- **core:** add POST /session/forgot-password/reset ([#1972](https://github.com/logto-io/logto/issues/1972)) ([acdc86c](https://github.com/logto-io/logto/commit/acdc86c8560d30a89eccb6b0f6892221ea1bc5e0))
- **core:** cannot delete custom phrase used as default language in sign-in exp ([#1951](https://github.com/logto-io/logto/issues/1951)) ([a1aef26](https://github.com/logto-io/logto/commit/a1aef26905f624569ee47e43bb3a9c9cf05b997b))
- **core:** machine to machine apps ([cd9c697](https://github.com/logto-io/logto/commit/cd9c6978a35d9fc3a571c7bd56c972939c49a9b5))

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))

### Reverts

- Revert "feat(console): auto detect language setting (#1941)" (#2004) ([ad1d1e3](https://github.com/logto-io/logto/commit/ad1d1e3b592b106b3cea4703d19bab041a9d48db)), closes [#1941](https://github.com/logto-io/logto/issues/1941) [#2004](https://github.com/logto-io/logto/issues/2004)

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### Features

- add Portuguese translation ([f268ecb](https://github.com/logto-io/logto/commit/f268ecb1a8d57d1e33225bec8852f3bc377dd478))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/phrases

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

### Features

- **console:** allow to disable create account ([#1806](https://github.com/logto-io/logto/issues/1806)) ([67305ec](https://github.com/logto-io/logto/commit/67305ec407d8a5ea1956e37df6dae2bdff012c06))

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

### ⚠ BREAKING CHANGES

- **core,console:** remove `/me` apis (#1781)

### Features

- **core:** hasura authn ([#1790](https://github.com/logto-io/logto/issues/1790)) ([87d3a53](https://github.com/logto-io/logto/commit/87d3a53b65ad18be337fffd78aaecd3483c8f33b))
- **phrases:** add french language ([#1767](https://github.com/logto-io/logto/issues/1767)) ([0503b30](https://github.com/logto-io/logto/commit/0503b30121b724040b0b052a031c680b8853b25c))

### Code Refactoring

- **core,console:** remove `/me` apis ([#1781](https://github.com/logto-io/logto/issues/1781)) ([2c6171c](https://github.com/logto-io/logto/commit/2c6171c2f97b5122c13dd959f507399b9a9d6aa4))

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

### Features

- **console:** show app secret ([#1723](https://github.com/logto-io/logto/issues/1723)) ([01dfeed](https://github.com/logto-io/logto/commit/01dfeed19b05219c1ab52790b3e98a029af02f90))

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Features

- **console:** add Next.js integration guide in admin console ([7d3f947](https://github.com/logto-io/logto/commit/7d3f94738f495de98464d23b6fdf18214d59005e))
- **phrases:** tr language ([#1707](https://github.com/logto-io/logto/issues/1707)) ([411a8c2](https://github.com/logto-io/logto/commit/411a8c2fa2bfb16c4fef5f0a55c3c1dc5ead1124))

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

### Bug Fixes

- **console:** should parse to json before using zod safeParse ([ec674ec](https://github.com/logto-io/logto/commit/ec674ecd7745beb3df2b651bfa98d5e8d4a62dfd))

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

### Features

- **console:** add a declaration file for `react-i18next` ([#1556](https://github.com/logto-io/logto/issues/1556)) ([6ae5e7d](https://github.com/logto-io/logto/commit/6ae5e7d9277e5dd77306fa790b95fb61110b7f44))

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

### Bug Fixes

- **connector:** passwordless connector send test msg with unsaved config ([#1539](https://github.com/logto-io/logto/issues/1539)) ([0297f6c](https://github.com/logto-io/logto/commit/0297f6c52f7b5d730de44fbb08f88c2e9b951874))
- **console:** redirect uri field label should display properly in guide ([#1549](https://github.com/logto-io/logto/issues/1549)) ([020f294](https://github.com/logto-io/logto/commit/020f294067835c333fe8f9dd1aa7e9798d48b731))

## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)

### Features

- **connector:** connector error handler, throw errmsg on general errors ([#1458](https://github.com/logto-io/logto/issues/1458)) ([7da1de3](https://github.com/logto-io/logto/commit/7da1de33e97de4aeeec9f9b6cea59d1bf90ba623))
- **console:** add placeholder for connector sender test ([#1476](https://github.com/logto-io/logto/issues/1476)) ([8e85a11](https://github.com/logto-io/logto/commit/8e85a115ec6fa009a53311553a5fc9e9d800c361))
- expose zod error ([#1474](https://github.com/logto-io/logto/issues/1474)) ([81b63f0](https://github.com/logto-io/logto/commit/81b63f07bb412abf1f2b42059bac2ffcfc86272c))

### Bug Fixes

- **console:** improve error handling in connector details and sender tester ([d9ce4a0](https://github.com/logto-io/logto/commit/d9ce4a01542da0d8ca5fc45a5086314d28e8f4da))

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

**Note:** Version bump only for package @logto/phrases

## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)

**Note:** Version bump only for package @logto/phrases

## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)

### Features

- **console:** unsaved changes alert ([#1409](https://github.com/logto-io/logto/issues/1409)) ([098367e](https://github.com/logto-io/logto/commit/098367e1a380d81261e056f222131f34fb6e10c5))

## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)

### Bug Fixes

- update en.ts ([#1403](https://github.com/logto-io/logto/issues/1403)) ([05c5740](https://github.com/logto-io/logto/commit/05c5740d3cd99dca9b2d8a4d52488b06ef0da957))

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/phrases

### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/phrases

### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)

**Note:** Version bump only for package @logto/phrases

### [0.1.2-alpha.2](https://github.com/logto-io/logto/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)

**Note:** Version bump only for package @logto/phrases

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/phrases

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **AC:** content updates ([#1003](https://github.com/logto-io/logto/issues/1003)) ([320a00b](https://github.com/logto-io/logto/commit/320a00bcf420d08252f9edf578dc36efd8742bce))
- **ac:** implement admin console welcome page ([#1139](https://github.com/logto-io/logto/issues/1139)) ([b42f4ba](https://github.com/logto-io/logto/commit/b42f4ba1ff11c769efece9f5cea75014924516fc))
- **connectors:** handle authorization callback parameters in each connector respectively ([#1166](https://github.com/logto-io/logto/issues/1166)) ([097aade](https://github.com/logto-io/logto/commit/097aade2e2e1b1ea1531bcb4c1cca8d24961a9b9))
- **console,core:** hide admin user ([#1182](https://github.com/logto-io/logto/issues/1182)) ([9194a6e](https://github.com/logto-io/logto/commit/9194a6ee547e2eb83ec106a834409c33644481e5))
- **console,ui:** generate dark mode color in console ([#1231](https://github.com/logto-io/logto/issues/1231)) ([f72b21d](https://github.com/logto-io/logto/commit/f72b21d1602ab0fb35ef3e7d84f6c8ebd7e18b08))
- **console:** add 404 page in admin console ([0d047fb](https://github.com/logto-io/logto/commit/0d047fbaf115f005615b5df06170e526283d9335))
- **console:** add comopnent alert ([#706](https://github.com/logto-io/logto/issues/706)) ([60920c2](https://github.com/logto-io/logto/commit/60920c28dd0ab5481138264a0961d674abaa613b))
- **console:** add mobile web tab in preview ([#1214](https://github.com/logto-io/logto/issues/1214)) ([9b6fd4c](https://github.com/logto-io/logto/commit/9b6fd4c417f2ee53375e436c839b711c86403d58))
- **console:** add placeholders ([#1277](https://github.com/logto-io/logto/issues/1277)) ([c26ca08](https://github.com/logto-io/logto/commit/c26ca08fb1109a2f3dae53bc8a1db5d8d7f6f47f))
- **console:** add user dropdown and sign out button ([5a09e7d](https://github.com/logto-io/logto/commit/5a09e7d6aa0d74215b299ef95b94bc715392cb77))
- **console:** audit log filters ([#1004](https://github.com/logto-io/logto/issues/1004)) ([a0d562f](https://github.com/logto-io/logto/commit/a0d562f7f24e10481c269b761c9a2c152affd50e))
- **console:** audit log table ([#1000](https://github.com/logto-io/logto/issues/1000)) ([fdd12de](https://github.com/logto-io/logto/commit/fdd12de1cf39c36dd65dd9365ad343478718d112))
- **console:** clear search results ([#1199](https://github.com/logto-io/logto/issues/1199)) ([a2de467](https://github.com/logto-io/logto/commit/a2de467873d4d92d52660b8095b831971402a8da))
- **console:** configure cors-allowed-origins ([#695](https://github.com/logto-io/logto/issues/695)) ([4a0577a](https://github.com/logto-io/logto/commit/4a0577accdb36e2b916b0e520b3352f6426b64c7))
- **console:** connector detail top card ([5288d6d](https://github.com/logto-io/logto/commit/5288d6d6f488077e4e9166a850f37c4283c93fe2))
- **console:** connector groups table ([#962](https://github.com/logto-io/logto/issues/962)) ([eb3f0cb](https://github.com/logto-io/logto/commit/eb3f0cbf5bb70bbab0e56e0f035f72594bfc555c))
- **console:** connector in use status ([#1012](https://github.com/logto-io/logto/issues/1012)) ([542d574](https://github.com/logto-io/logto/commit/542d57426fa8be1ccd98b6ab59ccac85e6d14a1b))
- **console:** connector warnings in sign in methods ([#710](https://github.com/logto-io/logto/issues/710)) ([cd03130](https://github.com/logto-io/logto/commit/cd0313065c777df3cf36373b31a2bb7e0e77cfe6))
- **console:** contact us icon and texts ([#836](https://github.com/logto-io/logto/issues/836)) ([c3785d8](https://github.com/logto-io/logto/commit/c3785d86cd6d377fbd5612e4b54529371dce19ee))
- **console:** dark logo ([#860](https://github.com/logto-io/logto/issues/860)) ([664a218](https://github.com/logto-io/logto/commit/664a2180a51b577fb517661cf0d7efb1374f3858))
- **console:** disable existing connectors when adding ([#1018](https://github.com/logto-io/logto/issues/1018)) ([19380d0](https://github.com/logto-io/logto/commit/19380d08739d219169bda1e1e8c2bf9101bd0e67))
- **console:** form field tooltip ([#786](https://github.com/logto-io/logto/issues/786)) ([1c7de47](https://github.com/logto-io/logto/commit/1c7de47a9326f326d5ec98fd9336037f5b75bf94))
- **console:** group connectors in add modal ([#1029](https://github.com/logto-io/logto/issues/1029)) ([fa420c9](https://github.com/logto-io/logto/commit/fa420c9fcb30450d1f0c8833bfe4febd031de5ba))
- **console:** hide get-started page on clicking 'Hide this' button ([7fd42fd](https://github.com/logto-io/logto/commit/7fd42fdaa17217f8be6ea120e287ea243904977a))
- **console:** implement get started page ([9790767](https://github.com/logto-io/logto/commit/979076769a069a3f100f33ed4cec9445ee0e18f5))
- **console:** implement get-started progress indicator component ([ed9387b](https://github.com/logto-io/logto/commit/ed9387bdda69d611ef7328214be300e17fa47135))
- **console:** init dashboard ([#1006](https://github.com/logto-io/logto/issues/1006)) ([28e09b6](https://github.com/logto-io/logto/commit/28e09b699424bb129a964ad61440e230c8baff50))
- **console:** input error message ([#1050](https://github.com/logto-io/logto/issues/1050)) ([458602f](https://github.com/logto-io/logto/commit/458602fd649170faab915e5079c56eb85540cb8e))
- **console:** integrate dark mode settings ([a04f818](https://github.com/logto-io/logto/commit/a04f818ffb8627a5c3d594edb466d1b8e45e3015))
- **console:** log details page ([#1064](https://github.com/logto-io/logto/issues/1064)) ([0421195](https://github.com/logto-io/logto/commit/04211957e1222f9597c32afd2982258afa73fa31))
- **console:** multi-text-input delete reminder ([#752](https://github.com/logto-io/logto/issues/752)) ([04fc5d4](https://github.com/logto-io/logto/commit/04fc5d48e9329b8fd713295207271803b54bbf35))
- **console:** reset user password ([#1266](https://github.com/logto-io/logto/issues/1266)) ([8c46ead](https://github.com/logto-io/logto/commit/8c46eada4be16fee3c7d6b5ec2786b3d9b214b00))
- **console:** sie form reorg ([#1218](https://github.com/logto-io/logto/issues/1218)) ([2c41334](https://github.com/logto-io/logto/commit/2c413341d1c515049faa130416f7a5e591d10e8a))
- **console:** sign in exp guide ([#755](https://github.com/logto-io/logto/issues/755)) ([bafd094](https://github.com/logto-io/logto/commit/bafd09474c68ca5539d676d2cbf06fa16e070edb))
- **console:** sign in experience preview ([#783](https://github.com/logto-io/logto/issues/783)) ([6ab54c9](https://github.com/logto-io/logto/commit/6ab54c968b38ce9d12f15ad2ec5615748b79d269))
- **console:** sign in experience setup others tab ([#662](https://github.com/logto-io/logto/issues/662)) ([875a31e](https://github.com/logto-io/logto/commit/875a31ec2ab129df13abf9036ead3922f786187e))
- **console:** sign in experience welcome page ([#746](https://github.com/logto-io/logto/issues/746)) ([d815d96](https://github.com/logto-io/logto/commit/d815d96f1f664ee0b700f6b2b1dfc36d87f1c2df))
- **console:** sign in methods change alert ([#701](https://github.com/logto-io/logto/issues/701)) ([a1ceea0](https://github.com/logto-io/logto/commit/a1ceea068542e46db3ed7f873f339edb3803ea3f))
- **console:** support persisting get-started progress in settings config ([43b2309](https://github.com/logto-io/logto/commit/43b2309c994b2eb8b1b8f1c12893eb66b5ce1d95))
- **console:** update cn phrases ([#1255](https://github.com/logto-io/logto/issues/1255)) ([77e1033](https://github.com/logto-io/logto/commit/77e1033751a34982c527d78a05a86502a2ee1f97))
- **console:** user connector delete confirmation ([#1165](https://github.com/logto-io/logto/issues/1165)) ([4905a5d](https://github.com/logto-io/logto/commit/4905a5d72f7007213a24dd64251ee26a53aabf6b))
- **core,console:** change admin user password ([#1268](https://github.com/logto-io/logto/issues/1268)) ([a4d0a94](https://github.com/logto-io/logto/commit/a4d0a940bdabb213866407afb6c064b6740ce593))
- **core,console:** connector platform tabs ([#887](https://github.com/logto-io/logto/issues/887)) ([65fb36c](https://github.com/logto-io/logto/commit/65fb36ce3fd021cd44aeff95c4a01e75fe1352e7))
- **core:** align connector error handler middleware with ConnectorErrorCodes ([#1063](https://github.com/logto-io/logto/issues/1063)) ([1b8190a](https://github.com/logto-io/logto/commit/1b8190addfd33bf9a317f991023984a2efdb6796))
- **core:** convert route guards to swagger.json ([#1047](https://github.com/logto-io/logto/issues/1047)) ([3145c9b](https://github.com/logto-io/logto/commit/3145c9b34824e9107a98625dc2998f605a936ae8))
- **core:** update connector db schema ([#732](https://github.com/logto-io/logto/issues/732)) ([8e1533a](https://github.com/logto-io/logto/commit/8e1533a70267d459feea4e5174296b17bef84d48))
- **dashboard:** add tooltip to dashboard items ([#1089](https://github.com/logto-io/logto/issues/1089)) ([9dd73ac](https://github.com/logto-io/logto/commit/9dd73ac1420c71093ee2a4ea35dc7d622ef062de))
- **demo-app:** implement (part 2) ([85a055e](https://github.com/logto-io/logto/commit/85a055efa4358cfb69c0d74f7aeaeb0bade024af))
- **ui:** add mobile terms of use iframe modal ([#947](https://github.com/logto-io/logto/issues/947)) ([4abcda6](https://github.com/logto-io/logto/commit/4abcda6820f0d824d110ee3ddd6d457433dfbf26))
- **ui:** add Notification component ([#994](https://github.com/logto-io/logto/issues/994)) ([8530e24](https://github.com/logto-io/logto/commit/8530e249aa6d63efe594a08f800be4bfb43ed77e))
- **ui:** app notification ([#999](https://github.com/logto-io/logto/issues/999)) ([f4e380f](https://github.com/logto-io/logto/commit/f4e380f0b1b815314b24cec1c9013d9f3bb806a7))
- **ui:** display error message on social callback page ([#1097](https://github.com/logto-io/logto/issues/1097)) ([f3b8678](https://github.com/logto-io/logto/commit/f3b8678a8c5e938276208c222242c3fedf4d397a))
- **ui:** not found page ([#691](https://github.com/logto-io/logto/issues/691)) ([731ff1c](https://github.com/logto-io/logto/commit/731ff1cbdca76104845dcf3d1223953ce8e5af93))

### Bug Fixes

- `lint:report` script ([#730](https://github.com/logto-io/logto/issues/730)) ([3b17324](https://github.com/logto-io/logto/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
- **console:** add code editor field label ([#1170](https://github.com/logto-io/logto/issues/1170)) ([9aab5ee](https://github.com/logto-io/logto/commit/9aab5eebf721fec2f3d57d87f7462e0fc728c114))
- **console:** add hover state to hide guide button ([#1328](https://github.com/logto-io/logto/issues/1328)) ([323895a](https://github.com/logto-io/logto/commit/323895a2dcf8fd703c0ae551fa3394ec1297c2ae))
- **console:** add mobile platform preview description ([#1032](https://github.com/logto-io/logto/issues/1032)) ([6167e5c](https://github.com/logto-io/logto/commit/6167e5c28d564453b45ee48f41c3aa86381334a1))
- **console:** change application column name ([#743](https://github.com/logto-io/logto/issues/743)) ([6148cbd](https://github.com/logto-io/logto/commit/6148cbd6f949a79874ec918e9be7933b72f06124))
- **console:** remove dashboard tip time range ([#1323](https://github.com/logto-io/logto/issues/1323)) ([3aac771](https://github.com/logto-io/logto/commit/3aac771f35bf2bda49c56f878f0823f3904028bb))
- **console:** remove role edit from user details ([#1173](https://github.com/logto-io/logto/issues/1173)) ([520f66c](https://github.com/logto-io/logto/commit/520f66cf3cae3b4d03e4c71f70df526a47bbc111))
- **console:** remove unused api resource help button ([#1217](https://github.com/logto-io/logto/issues/1217)) ([e5249e2](https://github.com/logto-io/logto/commit/e5249e2f8cc373dec32a0db1f67e6f1d7a252271))
- **console:** reset password label ([#1300](https://github.com/logto-io/logto/issues/1300)) ([628ac46](https://github.com/logto-io/logto/commit/628ac46a892095bb4be458da5b9c50a8935205ea))
- **console:** return to user-details page from user-log-details page ([#1135](https://github.com/logto-io/logto/issues/1135)) ([294c600](https://github.com/logto-io/logto/commit/294c60062e07d3a3f56a281e6a39a98aa3d92eb8))
- **console:** save changes button on settings page ([#1167](https://github.com/logto-io/logto/issues/1167)) ([97faade](https://github.com/logto-io/logto/commit/97faade141e070bac861700a488417231820233d))
- **console:** should not append slash in cors allowed uri ([#1001](https://github.com/logto-io/logto/issues/1001)) ([826f368](https://github.com/logto-io/logto/commit/826f368768c1f98e5f7316dce3f90d9c945c987a))
- **console:** show enabled platforms in detail tab ([#989](https://github.com/logto-io/logto/issues/989)) ([0656b6d](https://github.com/logto-io/logto/commit/0656b6d67d398e67253e2992d48273f3ebe314c1))
- **console:** ui fixes ([#678](https://github.com/logto-io/logto/issues/678)) ([dc976d8](https://github.com/logto-io/logto/commit/dc976d8248032b7a6d47a45f709cd82711db37de))
- **console:** update en phrases ([#1254](https://github.com/logto-io/logto/issues/1254)) ([a907ab4](https://github.com/logto-io/logto/commit/a907ab45fcbcc6ff6af45725858269e5b66354df))
- **console:** update get-started enable passwordless button text to "Enable" ([f7d2e4c](https://github.com/logto-io/logto/commit/f7d2e4cbd448356396788e127a8d8b6c03409387))
- **console:** upgrade react-sdk 0.1.7 ([a814e2c](https://github.com/logto-io/logto/commit/a814e2c829b5219da2b8299f9e78aa2c13d123a8))
- **core:** koaAuth should return 403 instead of 401 on non-admin role ([ee16eeb](https://github.com/logto-io/logto/commit/ee16eeb9662d99d04a8d2c2770f89f0641f1e743))
- **core:** remove unavailable social sign in targets on save ([#1201](https://github.com/logto-io/logto/issues/1201)) ([012562e](https://github.com/logto-io/logto/commit/012562e2a8226525b4d4b8c80eb092b1780e0221))
- **core:** signing in with a non-existing username should throw invalid credentials ([#1239](https://github.com/logto-io/logto/issues/1239)) ([53781d6](https://github.com/logto-io/logto/commit/53781d619dedc4e51d87d4ad917d0dbfcc1510d9))
- **ui:** add i18n formater for zh-CN list ([#1009](https://github.com/logto-io/logto/issues/1009)) ([ca5c8aa](https://github.com/logto-io/logto/commit/ca5c8aaec1db7ffc330f50fcdc14400e06ad6f54))
- **ui:** catch request exceptions with no response body ([#790](https://github.com/logto-io/logto/issues/790)) ([48de9c0](https://github.com/logto-io/logto/commit/48de9c072bb060f3e5aeb785d7a765a66a0912fe))
- **ui:** fix count down bug ([#874](https://github.com/logto-io/logto/issues/874)) ([9c1e9ef](https://github.com/logto-io/logto/commit/9c1e9ef7edb39d5d15dcbb21a8789fab78326de5))
- **ui:** ui design review fix ([#697](https://github.com/logto-io/logto/issues/697)) ([15dd1a7](https://github.com/logto-io/logto/commit/15dd1a767e9eddfd37a80b47775afbe327b76d5b))
- **ui:** ui refinement ([#855](https://github.com/logto-io/logto/issues/855)) ([1661c81](https://github.com/logto-io/logto/commit/1661c8121a9ed1620a4d8fefd51523d2be261089))
