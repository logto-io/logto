# Change Log

## 1.7.0

### Minor Changes

- 061a30a87: support agree to terms polices for Logto’s sign-in experiences

  - Automatic: Users automatically agree to terms by continuing to use the service
  - ManualRegistrationOnly: Users must agree to terms by checking a box during registration, and don't need to agree when signing in
  - Manual: Users must agree to terms by checking a box during registration or signing in

## 1.6.1

### Patch Changes

- abffb9f95: full oidc standard claims support

  We have added support for the remaining [OpenID Connect standard claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims). Now, these claims are accessible in both ID tokens and the response from the `/me` endpoint.

  Additionally, we adhere to the standard scopes - claims mapping. This means that you can retrieve most of the profile claims using the `profile` scope, and the `address` claim can be obtained by using the `address` scope.

  For all newly introduced claims, we store them in the `user.profile` field.

  > ![Note]
  > Unlike other database fields (e.g. `name`), the claims stored in the `profile` field will fall back to `undefined` rather than `null`. We refrain from using `?? null` here to reduce the size of ID tokens, since `undefined` fields will be stripped in tokens.

- Updated dependencies [abffb9f95]
  - @logto/core-kit@2.4.0

## 1.6.0

### Minor Changes

- 32df9acde: add all third-party related console, experience phrases

  - Add new i18n phrases for the third-party application management pages on the Admin Console.
  - Add new i18n phrases for the user consent page.
  - Add new i18n phrases for the user scopes as the description for all the Logto user claim scopes. Will be displayed on the user consent page.

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [9089dbf84]
- Updated dependencies [31e60811d]
  - @logto/language-kit@1.1.0
  - @logto/core-kit@2.3.0

## 1.5.0

### Minor Changes

- 9a7b19e49: Add single sign-in (SSO) related experience phrases

### Patch Changes

- Updated dependencies [b4f702a86]
  - @logto/core-kit@2.2.1

## 1.4.0

### Minor Changes

- 6727f629d: feature: introduce multi-factor authentication

  We're excited to announce that Logto now supports multi-factor authentication (MFA) for your sign-in experience. Navigate to the "Multi-factor auth" tab to configure how you want to secure your users' accounts.

  In this release, we introduce the following MFA methods:

  - Authenticator app OTP: users can add any authenticator app that supports the TOTP standard, such as Google Authenticator, Duo, etc.
  - WebAuthn (Passkey): users can use the standard WebAuthn protocol to register a hardware security key, such as biometric keys, Yubikey, etc.
  - Backup codes：users can generate a set of backup codes to use when they don't have access to other MFA methods.

  For a smooth transition, we also support to configure the MFA policy to require MFA for sign-in experience, or to allow users to opt-in to MFA.

## 1.3.1

### Patch Changes

- 6f5a0acad: fix a bug that prevents user from customizing i18n translations in Sign-in Experience config
- Updated dependencies [6f5a0acad]
  - @logto/core-kit@2.1.1

## 1.3.0

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
- f6723d5e2: rename the package `ui` to `experience`
- Updated dependencies [e8b0b1d02]
  - @logto/core-kit@2.1.0

## 1.2.0

### Minor Changes

- ae6a54993: add it translation
- 206fba2b5: add pl-PL translation

## 1.1.0

### Minor Changes

- 37714d153: add ja language
- f3d60a516: add es transaltion
- 5c50957a9: add zh-HK and zh-TW translation

### Patch Changes

- e9e8a6e11: update fr translation

## 1.0.0

### Major Changes

- 1c9160112: Packages are now ESM.

### Minor Changes

- 343b1090f: ### Update the password policy

  Password policy description: Password requires a minimum of 8 characters and contains a mix of letters, numbers, and symbols.

  - min-length updates: Password requires a minimum of 8 characters
  - allowed characters updates: Password contains a mix of letters, numbers, and symbols
    - digits: 0-9
    - letters: a-z, A-Z
    - symbols: !"#$%&'()\*+,./:;<=>?@[\]^\_`{|}~-
  - At least two types of characters are required:
    - letters and digits
    - letters and symbols
    - digits and symbols

  > notice: The new password policy is applied to new users or new passwords only. Existing users are not affected by this change, users may still use their old password to sign-in.

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
- c12717412: Added Russian translation.
- c12717412: ## Smart Identifier Input designed to streamline your sign-in experience

  - Smart Contact Input
  - Smart Identifier Input
  - Intelligent Identifier Input Field

  Content:
  We have integrated the traditional input fields for username, phone number, and email into a single intelligent input box. This advanced input box automatically identifies the type of characters you’re entering, such as an @ sign or consecutive numbers, and provides relevant error feedback. By streamlining the sign-in process, users no longer need to waste time figuring out which button to click to switch their desired login method. This reduces the risk of errors and ensures a smoother sign-in experience.

- 343b1090f: Implement a country code selector dropdown component with search box. Users may able to quick search for a country code by typing in the search box.
- 1c9160112: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

## 1.0.0-rc.1

### Minor Changes

- c12717412: ## Creating your social connector with ease

  We’re excited to announce that Logto now supports standard protocols (SAML, OIDC, and OAuth2.0) for creating social connectors to integrate external identity providers. Each protocol can create multiple social connectors, giving you more control over your access needs.

  To simplify the process of configuring social connectors, we’re replacing code-edit with simple forms. SAML already supports form configuration, with other connectors coming soon. This means you don’t need to compare documents or worry about code format.

- c12717412: Added Russian translation.
- c12717412: ## Smart Identifier Input designed to streamline your sign-in experience

  - Smart Contact Input
  - Smart Identifier Input
  - Intelligent Identifier Input Field

  Content:
  We have integrated the traditional input fields for username, phone number, and email into a single intelligent input box. This advanced input box automatically identifies the type of characters you’re entering, such as an @ sign or consecutive numbers, and provides relevant error feedback. By streamlining the sign-in process, users no longer need to waste time figuring out which button to click to switch their desired login method. This reduces the risk of errors and ensures a smoother sign-in experience.

## 1.0.0-beta.17

### Major Changes

- 1c916011: Packages are now ESM.

### Minor Changes

- 1c916011: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

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

- **console:** manage language ([#1981](https://github.com/logto-io/logto/issues/1981)) ([48832e5](https://github.com/logto-io/logto/commit/48832e50548421b876deaf10b1d3379674e7f562))
- **core,phrases:** add GET /phrase route ([#1959](https://github.com/logto-io/logto/issues/1959)) ([7ce55a8](https://github.com/logto-io/logto/commit/7ce55a8458166d1ca7453f3f637aed202860bf6c))
- **ui:** add reset password error handling flow ([#2079](https://github.com/logto-io/logto/issues/2079)) ([afa2ac4](https://github.com/logto-io/logto/commit/afa2ac47ee461e3526f61594e456d484fd3166af))

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### Features

- **ui:** add forget password page ([#1943](https://github.com/logto-io/logto/issues/1943)) ([39d80d9](https://github.com/logto-io/logto/commit/39d80d991235c93346c26977541d3c7040379a13))
- **ui:** add passwordless switch ([#1976](https://github.com/logto-io/logto/issues/1976)) ([ddb0e47](https://github.com/logto-io/logto/commit/ddb0e47950b3bd7f92af2a8a5e14b201e0a10ed7))
- **ui:** add reset password page ([#1961](https://github.com/logto-io/logto/issues/1961)) ([ff81b0f](https://github.com/logto-io/logto/commit/ff81b0f83e86dd3686341d3612f3f5e8f075cba6))

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))
- **phrases:** phrases-ui typo and types ([#1948](https://github.com/logto-io/logto/issues/1948)) ([2f373db](https://github.com/logto-io/logto/commit/2f373db8e43bc243973d2171867ee6e2169d280f))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### Features

- add Portuguese translation ([f268ecb](https://github.com/logto-io/logto/commit/f268ecb1a8d57d1e33225bec8852f3bc377dd478))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/phrases-ui

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

**Note:** Version bump only for package @logto/phrases-ui

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

### Features

- **phrases:** add french language ([#1767](https://github.com/logto-io/logto/issues/1767)) ([0503b30](https://github.com/logto-io/logto/commit/0503b30121b724040b0b052a031c680b8853b25c))

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

**Note:** Version bump only for package @logto/phrases-ui

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Features

- **phrases:** tr language ([#1707](https://github.com/logto-io/logto/issues/1707)) ([411a8c2](https://github.com/logto-io/logto/commit/411a8c2fa2bfb16c4fef5f0a55c3c1dc5ead1124))

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

**Note:** Version bump only for package @logto/phrases-ui

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

**Note:** Version bump only for package @logto/phrases-ui

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

**Note:** Version bump only for package @logto/phrases-ui

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/phrases-ui

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/phrases-ui

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **shared,phrases-ui:** not allow hyphens in username ([#1319](https://github.com/logto-io/logto/issues/1319)) ([5e81966](https://github.com/logto-io/logto/commit/5e819665c7c1d584ff5cff25e4e0723122be78b2))
