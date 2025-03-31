# Change Log

## 1.1.3

### Patch Changes

- 5da01bc47: make method `isLanguageTag` case-insensitive

  The language tags should be case insensitive. In `phrases` and `phrases-experience` packages, the language tags are all in lowercase. However, in the language kit, the language tags are in mixed cases, such as `pt-BR` and `zh-CN`.

  Therefore, some of the i18n phrases were not translated by the translate CLI tool. The fix is to update the language kit to ignore cases in `isLanguageTag` function, so that the previously mismatched language tags can be detected and translated.

## 1.1.2

### Patch Changes

- 59f6b8eda: update supported language list for better compatibility

## 1.1.1

### Patch Changes

- e11e57de8: bump dependencies for security update

## 1.1.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3

## 1.0.0

### Minor Changes

- 738675a7d: ## Improvements

  - Exported seed constants and schemas.
  - Add ID generation utilities `buildIdGenerator()` and `generateStandardId()`.

## 1.0.0-beta.30

### Minor Changes

- 738675a7: ## Improvements

  - Exported seed constants and schemas.
  - Add ID generation utilities `buildIdGenerator()` and `generateStandardId()`.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.29](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.28...v1.0.0-beta.29) (2022-12-07)

### Bug Fixes

- exports info and lock dep version ([#45](https://github.com/logto-io/toolkit/issues/45)) ([2ac83b4](https://github.com/logto-io/toolkit/commit/2ac83b4f0ff17579456569fb67ba018ac493c1af))

## [1.0.0-beta.28](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.27...v1.0.0-beta.28) (2022-12-06)

**Note:** Version bump only for package @logto/language-kit

## [1.0.0-beta.26](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.25...v1.0.0-beta.26) (2022-11-23)

**Note:** Version bump only for package @logto/language-kit

## [1.0.0-beta.24](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.23...v1.0.0-beta.24) (2022-11-22)

**Note:** Version bump only for package @logto/language-kit

## [1.0.0-beta.21](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2022-11-11)

**Note:** Version bump only for package @logto/language-kit

## [1.0.0-beta.20](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2022-10-21)

**Note:** Version bump only for package @logto/language-kit

## [1.0.0-beta.19](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2022-10-19)

### Bug Fixes

- language tag `jp` ([#28](https://github.com/logto-io/toolkit/issues/28)) ([0f5f6e6](https://github.com/logto-io/toolkit/commit/0f5f6e6a2cd9553e1a78aa7473f56e7631c2efc4))

## [1.0.0-beta.16](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2022-09-28)

### Bug Fixes

- **core,language:** avoid using path aliases ([#15](https://github.com/logto-io/toolkit/issues/15)) ([22db3ed](https://github.com/logto-io/toolkit/commit/22db3ed2daf3ee5906ffc864bb9bed1a826df842))

## [1.0.0-beta.15](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2022-09-27)

### Features

- **language,core,connector:** init language-kit package ([#14](https://github.com/logto-io/toolkit/issues/14)) ([9a74fc4](https://github.com/logto-io/toolkit/commit/9a74fc4d34c9ce277b8734ab78735549dc3a3cda))
