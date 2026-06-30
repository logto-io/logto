# @logto/connector-qq

## 1.1.5

### Patch Changes

- 0b371f66c6: support QQ social identity verification with stored redirect URI
- Updated dependencies [e7b6e9de1]
- Updated dependencies [b7386a5113]
  - @logto/connector-kit@5.1.0

## 1.1.4

### Patch Changes

- Updated dependencies [41a56f79e3]
  - @logto/connector-kit@5.0.1

## 1.1.3

### Patch Changes

- Updated dependencies [4e25126228]
- Updated dependencies [4e25126228]
  - @logto/connector-kit@5.0.0

## 1.1.2

### Patch Changes

- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @logto/connector-kit@4.7.0

## 1.1.1

### Patch Changes

- Updated dependencies [ad4f9d6abf]
- Updated dependencies [5da6792d40]
  - @logto/connector-kit@4.6.0

## 1.1.0

### Minor Changes

- 34964af46: feat: support custom scope in the `getAuthorizationUri` method

  This change allows the `getAuthorizationUri` method in the social connectors to accept an extra `scope` parameter, enabling more flexible authorization requests.

  If the scope is provided, it will be used in the authorization request; otherwise, the default scope configured in the connector settings will be used.

### Patch Changes

- Updated dependencies [34964af46]
  - @logto/connector-kit@4.4.0

## 1.0.0

### Major Changes

- 2f8f9d631: add QQ social connector for web
