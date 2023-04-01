# @logto/connector-tencent-sms

## 1.0.0

### Major Changes

- 4ed07d2: bump connector-kit to v1.0.0

### Minor Changes

- 8c0654a: - Add "Generic" verification code type, remove deprecated "Continue" code type. Generic type verification code is used when user needs to send and verify verification code through our management APIs. Correspondingly, a "Generic" type mail or SMS template should be configured in the connector config.
  - Replace the term "passcode" with "verification code".
- 269d701: The console connector configuration page has been changed from JSON format to form view.

### Patch Changes

- 9ff0638: update connector-kit version
- 7b0bf69: Bump version to upgrade connector kit
- 4ec0889: bump connector-kit version
- d8b9dea: 1. Update `@logto/connector-kit` from `1.0.0-beta.32` to `1.0.0-beta.33`.
- d183d6d: Upgrade connector-kit
- a5f57f8: Update README, default value and type guard of passwordless connectors' template field since we will use Generic template for all other cases rather than Sign-in, Register and ForgotPassword.

## 1.0.0-beta.22

### Patch Changes

- 4ec0889: bump connector-kit version

## 1.0.0-beta.21

### Patch Changes

- a5f57f8: Update README, default value and type guard of passwordless connectors' template field since we will use Generic template for all other cases rather than Sign-in, Register and ForgotPassword.

## 1.0.0-beta.20

### Minor Changes

- 269d701: The console connector configuration page has been changed from JSON format to form view.

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
