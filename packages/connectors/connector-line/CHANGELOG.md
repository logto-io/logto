# @logto/connector-line

## 0.3.7

### Patch Changes

- d89e507: support Node.js 26

  Logto and the published packages now declare support for Node.js 22, 24 and 26. The minimum supported versions are 22.23.4, 24.22.1 and 26.12.1, which include the October 2026 Node.js security fixes.

- 664e6ac: show the provider's actual error message instead of `{}` when a social connector request fails
- Updated dependencies [800eb13]
- Updated dependencies [d89e507]
- Updated dependencies [9d7d323]
- Updated dependencies [664e6ac]
- Updated dependencies [05678f9]
  - @logto/connector-kit@5.2.0

## 0.3.6

### Patch Changes

- @logto/connector-kit@5.1.1

## 0.3.5

### Patch Changes

- Updated dependencies [e7b6e9de1]
- Updated dependencies [b7386a5113]
  - @logto/connector-kit@5.1.0

## 0.3.4

### Patch Changes

- Updated dependencies [41a56f79e3]
  - @logto/connector-kit@5.0.1

## 0.3.3

### Patch Changes

- Updated dependencies [4e25126228]
- Updated dependencies [4e25126228]
  - @logto/connector-kit@5.0.0

## 0.3.2

### Patch Changes

- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @logto/connector-kit@4.7.0

## 0.3.1

### Patch Changes

- Updated dependencies [ad4f9d6abf]
- Updated dependencies [5da6792d40]
  - @logto/connector-kit@4.6.0

## 0.3.0

### Minor Changes

- 34964af46: feat: support custom scope in the `getAuthorizationUri` method

  This change allows the `getAuthorizationUri` method in the social connectors to accept an extra `scope` parameter, enabling more flexible authorization requests.

  If the scope is provided, it will be used in the authorization request; otherwise, the default scope configured in the connector settings will be used.

### Patch Changes

- Updated dependencies [34964af46]
  - @logto/connector-kit@4.4.0

## 0.2.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/connector-kit@4.3.0

## 0.1.1

### Patch Changes

- f67500cb5: update connector logo for light mode and dark mode
- Updated dependencies [b0135bcd3]
  - @logto/connector-kit@4.2.0

## 0.1.0

### Minor Changes

- 3d4f74675: add Line social connector

### Patch Changes

- Updated dependencies [e11e57de8]
  - @logto/connector-kit@4.1.1
