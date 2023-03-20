# Change Log

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
