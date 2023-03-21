# Change Log

## 1.0.1

## 1.0.0

### Major Changes

- 343b1090f: **Seed data for cloud**

  - cli!: remove `oidc` option for `database seed` command as it's unused
  - cli: add hidden `--cloud` option for `database seed` command to init cloud data
  - cli, cloud: appending Redirect URIs to Admin Console will deduplicate values before update
  - move `UrlSet` and `GlobalValues` to `@logto/shared`

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

- f41fd3f05: Add `logto database alteration rollback` command for running `down()` alteration scripts
- 343b1090f: Allow admin tenant admin to create tenants without limitation
- 343b1090f: Add CLI command to get/set db's system table value
- f41fd3f05: - cli: use `ec` with `secp384r1` as the default key generation type
  - core: use `ES384` as the signing algorithm for EC keys
- 3ff2e90cd: **CLI**

  **Rotate your private or secret key**

  We add a new command `db config rotate <key>` to support key rotation via CLI.

  When rotating, the CLI will generate a new key and prepend to the corresponding key array. Thus the old key is still valid and the service will use the new key for signing.

  Run `logto db config rotate help` for detailed usage.

  **Trim the private or secret key you don't need**

  If you want to trim one or more out-dated private or secret key(s) from the config, use the command `db config trim <key>`. It will remove the last item (private or secret key) in the array.

  You may remove the old key after a certain period (such as half a year) to allow most of your users have time to touch the new key.

  If you want to remove multiple keys at once, just append a number to the command. E.g. `logto db config trim oidc.cookieKeys 3`.

  Run `logto db config trim help` for detailed usage.

### Patch Changes

- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.
- 7fb689b73: Fix version lifecycle script
- 1c9160112: - Remove official connectors inquiry
  - Fix default download url with current package version
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
  - @logto/shared@1.0.0
  - @logto/connector-kit@1.1.0
  - @logto/core-kit@1.1.0

## 1.0.0-rc.3

## 1.0.0-rc.2

### Patch Changes

- Updated dependencies [c12717412]
  - @logto/schemas@1.0.0-rc.1
  - @logto/shared@1.0.0-rc.1

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

- f41fd3f0: Add `logto database alteration rollback` command for running `down()` alteration scripts
- f41fd3f0: - cli: use `ec` with `secp384r1` as the default key generation type
  - core: use `ES384` as the signing algorithm for EC keys

### Patch Changes

- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
  - @logto/schemas@1.0.0-rc.0
  - @logto/shared@1.0.0-rc.0

## 1.0.0-beta.19

### Patch Changes

- df9e98dc: Fix version lifecycle script
- Updated dependencies [df9e98dc]
  - @logto/schemas@1.0.0-beta.18
  - @logto/shared@1.0.0-beta.18

## 1.0.0-beta.18

### Major Changes

- 1c916011: Packages are now ESM.

### Patch Changes

- 1c916011: - Remove official connectors inquiry
  - Fix default download url with current package version
- Updated dependencies [1c916011]
- Updated dependencies [1c916011]
  - @logto/schemas@1.0.0-beta.17
  - @logto/shared@1.0.0-beta.17

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.
- Updated dependencies [38970fb8]
  - @logto/schemas@1.0.0-beta.16
  - @logto/shared@1.0.0-beta.16

## 1.0.0-beta.15

### Patch Changes

- Updated dependencies
  - @logto/schemas@1.0.0-beta.15
  - @logto/shared@1.0.0-beta.15

## 1.0.0-beta.14

### Patch Changes

- Updated dependencies [2d45cc3e]
  - @logto/schemas@1.0.0-beta.14
  - @logto/shared@1.0.0-beta.14

## 1.0.0-beta.13

### Minor Changes

- 3ff2e90c: **CLI**

  **Rotate your private or secret key**

  We add a new command `db config rotate <key>` to support key rotation via CLI.

  When rotating, the CLI will generate a new key and prepend to the corresponding key array. Thus the old key is still valid and the service will use the new key for signing.

  Run `logto db config rotate help` for detailed usage.

  **Trim the private or secret key you don't need**

  If you want to trim one or more out-dated private or secret key(s) from the config, use the command `db config trim <key>`. It will remove the last item (private or secret key) in the array.

  You may remove the old key after a certain period (such as half a year) to allow most of your users have time to touch the new key.

  If you want to remove multiple keys at once, just append a number to the command. E.g. `logto db config trim oidc.cookieKeys 3`.

  Run `logto db config trim help` for detailed usage.

### Patch Changes

- @logto/schemas@1.0.0-beta.13
- @logto/shared@1.0.0-beta.13

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

**Note:** Version bump only for package @logto/cli

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

### Features

- `npm create` compatibility ([a5cd73d](https://github.com/logto-io/logto/commit/a5cd73d961766c7c72180795051feabe9793fc7d))
- **cli:** `db alteration deploy` command ([a5280a2](https://github.com/logto-io/logto/commit/a5280a2afd3d5822e78d1f115ab6f6fdbb993261))
- **cli:** `db seed oidc` command ([911117a](https://github.com/logto-io/logto/commit/911117a785fd43ea03473f42835f2680cccca7be))
- **cli:** `db seed` command ([5c7000d](https://github.com/logto-io/logto/commit/5c7000ddc30e316bd17f34d71d51c17016efec76))
- **cli:** add `download-url` option for install ([5dda0a6](https://github.com/logto-io/logto/commit/5dda0a6dd0e04468c078e3581e68a614ce23404c))
- **cli:** add connector command ([4ccbe4a](https://github.com/logto-io/logto/commit/4ccbe4ac6566aff0db1cd98a74441640677f6060))
- **cli:** command `init/i/install` ([f05691b](https://github.com/logto-io/logto/commit/f05691b4319279a49bf0bc87ba656b7990d52e53))
- **cli:** database config command ([0eb306a](https://github.com/logto-io/logto/commit/0eb306a61cf88b8be3be86852cb66b1d99ad713f))
- **cli:** get/set db config key ([0eff1e3](https://github.com/logto-io/logto/commit/0eff1e3591129802f3e9b3286652ef6fc8619cf5))
- **cli:** list connectors ([dcb9142](https://github.com/logto-io/logto/commit/dcb91428e6ef1021e383270e66d3e67bfc83e593))
- **cli:** remove connectors ([7d257c4](https://github.com/logto-io/logto/commit/7d257c45bfa37298c287b3ac867acd0606c4f028))

### Bug Fixes

- add publish config for public packages ([#2192](https://github.com/logto-io/logto/issues/2192)) ([38f664c](https://github.com/logto-io/logto/commit/38f664c27c4927970f40336b04154a5803cb5dc0))
- alteration script in dev ([9ebb3dd](https://github.com/logto-io/logto/commit/9ebb3ddfd963f6459ea332dbe1384058f77b453b))
- **cli:** `chooseAlterationsByVersion` should contain the last `next` version alteration script ([#2175](https://github.com/logto-io/logto/issues/2175)) ([fd50304](https://github.com/logto-io/logto/commit/fd50304f5ff5ffbc985695eaa73c1bc56b1ca061))
- **cli:** fix skip-when-exists option ([#2180](https://github.com/logto-io/logto/issues/2180)) ([4ce2073](https://github.com/logto-io/logto/commit/4ce207369228d404d919c491ba398acedcfd55fa))
