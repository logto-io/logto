# @logto/connector-huggingface

## 0.4.2

### Patch Changes

- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @logto/connector-kit@4.7.0
  - @logto/connector-oauth@1.7.2

## 0.4.1

### Patch Changes

- Updated dependencies [ad4f9d6abf]
- Updated dependencies [5da6792d40]
  - @logto/connector-kit@4.6.0
  - @logto/connector-oauth@1.7.1

## 0.4.0

### Minor Changes

- 34964af46: feat: support custom scope in the `getAuthorizationUri` method

  This change allows the `getAuthorizationUri` method in the social connectors to accept an extra `scope` parameter, enabling more flexible authorization requests.

  If the scope is provided, it will be used in the authorization request; otherwise, the default scope configured in the connector settings will be used.

### Patch Changes

- Updated dependencies [0343699d7]
- Updated dependencies [34964af46]
  - @logto/connector-oauth@1.7.0
  - @logto/connector-kit@4.4.0

## 0.3.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/connector-oauth@1.6.0
  - @logto/connector-kit@4.3.0

## 0.2.1

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/connector-oauth@1.5.1
  - @logto/connector-kit@4.1.1

## 0.2.0

### Minor Changes

- 510f681fa: use tsup for building

  We've updated some of the packages to use `tsup` for building. This will make the build process faster, and should not affect the functionality of the packages.

  Use minor version bump to catch your attention.

### Patch Changes

- Updated dependencies [510f681fa]
  - @logto/connector-oauth@1.4.0

## 0.1.1

### Patch Changes

- Updated dependencies [6308ee185]
- Updated dependencies [15953609b]
- Updated dependencies [6308ee185]
  - @logto/connector-kit@4.0.0
  - @logto/connector-oauth@1.3.1

## 0.1.0

### Minor Changes

- 3e5ffc499: add Hugging Face social connector

### Patch Changes

- Updated dependencies [f9c7a72d5]
  - @logto/connector-oauth@1.3.0
