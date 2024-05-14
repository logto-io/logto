# Change Log

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
