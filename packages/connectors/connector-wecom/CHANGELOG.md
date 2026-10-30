# @logto/connector-wecom

## 0.6.4

### Patch Changes

- d89e507: support Node.js 26

  Logto and the published packages now declare support for Node.js 22, 24 and 26. The minimum supported versions are 22.23.4, 24.22.1 and 26.12.1, which include the October 2026 Node.js security fixes.

- Updated dependencies [800eb13]
- Updated dependencies [d89e507]
- Updated dependencies [9d7d323]
- Updated dependencies [664e6ac]
- Updated dependencies [05678f9]
  - @logto/connector-kit@5.2.0

## 0.6.3

### Patch Changes

- Updated dependencies [16f4b2e732]
  - @logto/shared@3.4.3
  - @logto/connector-kit@5.1.1

## 0.6.2

### Patch Changes

- Updated dependencies [58cb52c705]
  - @logto/shared@3.4.2

## 0.6.1

### Patch Changes

- Updated dependencies [e7b6e9de1]
- Updated dependencies [b7386a5113]
- Updated dependencies [67b99bba85]
  - @logto/connector-kit@5.1.0
  - @logto/shared@3.4.1

## 0.6.0

### Minor Changes

- 9e000e650d: fetch user profile details via additional APIs

### Patch Changes

- Updated dependencies [41a56f79e3]
  - @logto/connector-kit@5.0.1

## 0.5.3

### Patch Changes

- Updated dependencies [4e25126228]
- Updated dependencies [4e25126228]
  - @logto/connector-kit@5.0.0

## 0.5.2

### Patch Changes

- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @logto/connector-kit@4.7.0

## 0.5.1

### Patch Changes

- Updated dependencies [ad4f9d6abf]
- Updated dependencies [5da6792d40]
  - @logto/connector-kit@4.6.0

## 0.5.0

### Minor Changes

- 34964af46: feat: support custom scope in the `getAuthorizationUri` method

  This change allows the `getAuthorizationUri` method in the social connectors to accept an extra `scope` parameter, enabling more flexible authorization requests.

  If the scope is provided, it will be used in the authorization request; otherwise, the default scope configured in the connector settings will be used.

### Patch Changes

- Updated dependencies [34964af46]
  - @logto/connector-kit@4.4.0

## 0.4.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/connector-kit@4.3.0

## 0.3.2

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/connector-kit@4.1.1

## 0.3.1

### Patch Changes

- 763dd60cd: fix wecom connector platform, should be `Universal` instead of `null`

## 0.3.0

### Minor Changes

- 510f681fa: use tsup for building

  We've updated some of the packages to use `tsup` for building. This will make the build process faster, and should not affect the functionality of the packages.

  Use minor version bump to catch your attention.

## 0.2.1

### Patch Changes

- Updated dependencies [6308ee185]
- Updated dependencies [15953609b]
- Updated dependencies [6308ee185]
  - @logto/connector-kit@4.0.0

## 0.2.0

### Minor Changes

- 57d97a4df: return and store social connector raw data

### Patch Changes

- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/connector-kit@3.0.0
