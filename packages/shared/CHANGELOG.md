# Change Log

## 3.1.1

### Patch Changes

- 21bb35b12: add `normalizeError` method to `@logto/shared` package

  Use this method to normalize error objects for logging. This method is useful for logging errors in a consistent format.

## 3.1.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- acb7fd3fe: Add case sensitive username env variable
- 9089dbf84: upgrade TypeScript to 5.3.3

## 3.0.0

### Major Changes

- 18181f892: standardize id and secret generators

  - Remove `buildIdGenerator` export from `@logto/shared`
  - Add `generateStandardSecret` and `generateStandardShortId` exports to `@logto/shared`
  - Align comment and implementation of `buildIdGenerator` in `@logto/shared`
    - The comment stated the function will include uppercase letters by default, but it did not; Now it does.
  - Use `generateStandardSecret` for all secret generation

## 2.0.1

### Patch Changes

- 310698b0d: align cli output for a better looking

## 2.0.0

### Major Changes

- 30033421c: - connector-kit: add `DemoConnector` type and demo connector ids
  - core-kit: remove nanoid utils, add tenant model utils
  - shared: remove models, add database types and universal export

### Patch Changes

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

## 1.0.3

### Patch Changes

- @logto/schemas@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies [5b4da1e3d]
  - @logto/schemas@1.0.7

## 1.0.1

### Patch Changes

- Updated dependencies [621b09ba1]
  - @logto/schemas@1.0.1

## 1.0.0

### Major Changes

- 1c9160112: Packages are now ESM.

### Minor Changes

- 343b1090f: Add demo social connectors for new tenant
- 343b1090f: Allow admin tenant admin to create tenants without limitation

### Patch Changes

- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.
- 343b1090f: **Seed data for cloud**

  - cli!: remove `oidc` option for `database seed` command as it's unused
  - cli: add hidden `--cloud` option for `database seed` command to init cloud data
  - cli, cloud: appending Redirect URIs to Admin Console will deduplicate values before update
  - move `UrlSet` and `GlobalValues` to `@logto/shared`

- Updated dependencies [343b1090f]
- Updated dependencies [e63f5f8b0]
- Updated dependencies [f41fd3f05]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [38970fb88]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [1c9160112]
- Updated dependencies [1c9160112]
- Updated dependencies [7fb689b73]
- Updated dependencies [343b1090f]
- Updated dependencies [f41fd3f05]
- Updated dependencies [f41fd3f05]
- Updated dependencies [2d45cc3e6]
  - @logto/schemas@1.0.0
  - @logto/core-kit@1.1.0

## 1.0.0-rc.1

### Patch Changes

- Updated dependencies [c12717412]
  - @logto/schemas@1.0.0-rc.1

## 1.0.0-rc.0

### Patch Changes

- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
  - @logto/schemas@1.0.0-rc.0

## 1.0.0-beta.18

### Patch Changes

- Updated dependencies [df9e98dc]
  - @logto/schemas@1.0.0-beta.18

## 1.0.0-beta.17

### Major Changes

- 1c916011: Packages are now ESM.

### Patch Changes

- Updated dependencies [1c916011]
- Updated dependencies [1c916011]
  - @logto/schemas@1.0.0-beta.17

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.
- Updated dependencies [38970fb8]
  - @logto/schemas@1.0.0-beta.16

## 1.0.0-beta.15

### Patch Changes

- Updated dependencies
  - @logto/schemas@1.0.0-beta.15

## 1.0.0-beta.14

### Patch Changes

- Updated dependencies [2d45cc3e]
  - @logto/schemas@1.0.0-beta.14

## 1.0.0-beta.13

### Patch Changes

- @logto/schemas@1.0.0-beta.13

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

### Bug Fixes

- make packages public ([e24fd04](https://github.com/logto-io/logto/commit/e24fd0479bc20c92bd38b5e214abe441404ce496))

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

**Note:** Version bump only for package @logto/shared
