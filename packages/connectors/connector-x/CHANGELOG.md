# @logto/connector-x

## 0.4.1

### Patch Changes

- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @logto/connector-kit@4.7.0

## 0.4.0

### Minor Changes

- eeeba78f99: add email syncing to x connector

  You can now add the `users.email` scope to sync users' email addresses from X accounts.

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

- ae3bda717: add X (Twitter) social connector

### Patch Changes

- Updated dependencies [e11e57de8]
  - @logto/connector-kit@4.1.1
