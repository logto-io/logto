# Change Log

## 1.4.1

### Patch Changes

- 3b9714b99: set `lang` attribute for `<html>`
- fae8725a4: improve RTL language support

## 1.4.0

### Minor Changes

- 3a839f6d6: support extra token params in dev panel
- 3bf756f2b: use Vite for transpilation and bundling

  Removed ParcelJS and replaced with Vite. No breaking changes should be expected, but use a minor version bump to catch your attention.

  > [!Important]
  > The browserlist configuration for `@logto/experience` and been synced with what is stated in README.md.

## 1.3.0

### Minor Changes

- f78b1768e: add dev panel

## 1.2.0

### Minor Changes

- 2cbc591ff: carry over search params to the authentication request

  When entering the Logto demo app with search parameters, if the user is not authenticated, the search parameters are now carried over to the authentication request. This allows manual testing of the OIDC authentication flow with specific parameters.

## 1.1.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3

## 1.0.1

### Patch Changes

- 046a5771b: upgrade i18next series packages (#3733, #3743)

## 1.0.0

### Major Changes

- 1c9160112: Packages are now ESM.

## 1.0.0-beta.13

### Major Changes

- 1c916011: Packages are now ESM.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### Bug Fixes

- downgrade to sdk 1.0.0-beta.2 ([#1896](https://github.com/logto-io/logto/issues/1896)) ([91d1bf8](https://github.com/logto-io/logto/commit/91d1bf8004165e3ab42dfd705046ef7f3bd612d9))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

### Bug Fixes

- build and types ([8b51543](https://github.com/logto-io/logto/commit/8b515435cdb0644d0ca19e2c26ba3e744355bb0b))
- **ui,console,demo-app:** update react render method ([#1750](https://github.com/logto-io/logto/issues/1750)) ([4b972f2](https://github.com/logto-io/logto/commit/4b972f2e23e2d4609d9955c4d1d42972f368f5b9))

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

### Bug Fixes

- **demo-app:** hide username if not exists ([#1644](https://github.com/logto-io/logto/issues/1644)) ([8b30f97](https://github.com/logto-io/logto/commit/8b30f974bfa4fa9c1aa43d2bcc22779a454905db))

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)

### Bug Fixes

- **demo-app:** username should not overflow info card ([#1498](https://github.com/logto-io/logto/issues/1498)) ([58558e5](https://github.com/logto-io/logto/commit/58558e50110349262c7a28f0195a7042f6fca732))

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)

**Note:** Version bump only for package @logto/demo-app

## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)

**Note:** Version bump only for package @logto/demo-app

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/demo-app

### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/demo-app

### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)

**Note:** Version bump only for package @logto/demo-app

### [0.1.2-alpha.2](https://github.com/logto-io/logto/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)

**Note:** Version bump only for package @logto/demo-app

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/demo-app

### [0.1.2-alpha.0](https://github.com/logto-io/logto/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2022-07-02)

**Note:** Version bump only for package @logto/demo-app

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **demo-app:** implement (part 2) ([85a055e](https://github.com/logto-io/logto/commit/85a055efa4358cfb69c0d74f7aeaeb0bade024af))
- **demo-app:** implementation ([#982](https://github.com/logto-io/logto/issues/982)) ([7f4f4f8](https://github.com/logto-io/logto/commit/7f4f4f84addf8a25c3d30f1ac3ceeef460afcf17))
- **demo-app:** implementation (3/3) ([#1021](https://github.com/logto-io/logto/issues/1021)) ([91e2f05](https://github.com/logto-io/logto/commit/91e2f055f2eb75ef8846b02d0d211adbbb898b41))
- **demo-app:** init ([#979](https://github.com/logto-io/logto/issues/979)) ([ad0aa8e](https://github.com/logto-io/logto/commit/ad0aa8e0c20a8d60f095b477e942b724fb53ca7d))
- **demo-app:** show notification in main flow ([#1038](https://github.com/logto-io/logto/issues/1038)) ([90ca76e](https://github.com/logto-io/logto/commit/90ca76eeb5460b66d2241f137f179bf4d5d6ae37))

### Bug Fixes

- **console:** bump react sdk to 0.1.13 to resolve sign in issue ([fb34cdc](https://github.com/logto-io/logto/commit/fb34cdc3793c3768e759c4e13a898716de22566c))
