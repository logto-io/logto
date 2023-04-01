# Change Log

## 1.0.0

### Major Changes

- 4ed07d2: bump connector-kit to v1.0.0

### Minor Changes

- 8c0654a: - Add "Generic" verification code type, remove deprecated "Continue" code type. Generic type verification code is used when user needs to send and verify verification code through our management APIs. Correspondingly, a "Generic" type mail or SMS template should be configured in the connector config.
  - Replace the term "passcode" with "verification code".

### Patch Changes

- 9ff0638: update connector-kit version
- 7b0bf69: Bump version to upgrade connector kit
- 4ec0889: bump connector-kit version
- d8b9dea: 1. Update `@logto/connector-kit` from `1.0.0-beta.32` to `1.0.0-beta.33`.
- d183d6d: Upgrade connector-kit
- a5f57f8: Update README, default value and type guard of passwordless connectors' template field since we will use Generic template for all other cases rather than Sign-in, Register and ForgotPassword.

## 1.0.0-beta.21

### Patch Changes

- 4ec0889: bump connector-kit version

## 1.0.0-beta.20

### Patch Changes

- a5f57f8: Update README, default value and type guard of passwordless connectors' template field since we will use Generic template for all other cases rather than Sign-in, Register and ForgotPassword.

## 1.0.0-beta.19

### Patch Changes

- 7b0bf69: Bump version to upgrade connector kit

## 1.0.0-beta.18

### Patch Changes

- 9ff0638: update connector-kit version

## 1.0.0-beta.17

### Minor Changes

- 8c0654a: - Add "Generic" verification code type, remove deprecated "Continue" code type. Generic type verification code is used when user needs to send and verify verification code through our management APIs. Correspondingly, a "Generic" type mail or SMS template should be configured in the connector config.
  - Replace the term "passcode" with "verification code".

### Patch Changes

- d8b9dea: 1. Update `@logto/connector-kit` from `1.0.0-beta.32` to `1.0.0-beta.33`.

## 1.0.0-beta.16

### Patch Changes

- d183d6d: Upgrade connector-kit

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/connectors/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-29)

### Features

- add forgot password and continue templates for sms and email ([#36](https://github.com/logto-io/connectors/issues/36)) ([4ad3551](https://github.com/logto-io/connectors/commit/4ad35516c0770ec344caf0bcc68b572c832b30a0))
- add mock standard email connector ([#35](https://github.com/logto-io/connectors/issues/35)) ([479114e](https://github.com/logto-io/connectors/commit/479114e847fb4b11c6fbd697a36b7f5eb56305ed))

## [1.0.0-beta.11](https://github.com/logto-io/connectors/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-11-06)

**Note:** Version bump only for package @logto/connector-mock-sms

## [1.0.0-beta.10](https://github.com/logto-io/connectors/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-27)

**Note:** Version bump only for package @logto/connector-mock-sms

## 1.0.0-beta.9 (2022-09-18)

### Features

- add connectors ([#2](https://github.com/logto-io/connectors/issues/2)) ([2fbb578](https://github.com/logto-io/connectors/commit/2fbb57815406bace113617a6304eafcfc5db2d61))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/connector-mock-sms

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

**Note:** Version bump only for package @logto/connector-mock-sms

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

**Note:** Version bump only for package @logto/connector-mock-sms

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

**Note:** Version bump only for package @logto/connector-mock-sms

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Features

- **phrases:** tr language ([#1707](https://github.com/logto-io/logto/issues/1707)) ([411a8c2](https://github.com/logto-io/logto/commit/411a8c2fa2bfb16c4fef5f0a55c3c1dc5ead1124))
