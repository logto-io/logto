# @logto/connector-patreon

## 1.1.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/connector-oauth@1.6.0
  - @logto/connector-kit@4.3.0

## 1.0.1

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/connector-oauth@1.5.1
  - @logto/connector-kit@4.1.1

## 1.0.0

### Major Changes

- aba089285: add Patreon social connector

  ### Major Changes

  - Initial release of the Patreon connector.

    This release introduces the Logto connector for Patreon, enabling social sign-in using Patreon accounts. It supports OAuth 2.0 authentication flow, fetching user information, and handling errors gracefully.

  ### Features

  - **OAuth 2.0 Authentication**: Support for OAuth 2.0 authentication flow with Patreon.
  - **User Information Retrieval**: Fetches user details such as full name, email, profile URL, and avatar.
  - **Error Handling**: Graceful handling of OAuth errors, including token exchange failures and user-denied permissions.
  - **Configurable Scope**: Allows customization of OAuth scopes to access different levels of user information.

### Patch Changes

- Updated dependencies [27d2c91d2]
  - @logto/connector-oauth@1.5.0
