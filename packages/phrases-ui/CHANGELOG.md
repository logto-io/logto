# Change Log

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
