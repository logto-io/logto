# @logto/connector-http-email

## 0.3.2

### Patch Changes

- Updated dependencies [5da6792d40]
  - @logto/connector-kit@4.6.0

## 0.3.1

### Patch Changes

- Updated dependencies [34964af46]
  - @logto/connector-kit@4.4.0

## 0.3.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/connector-kit@4.3.0

## 0.2.1

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/connector-kit@4.1.1

## 0.2.0

### Minor Changes

- 67b3aea3f: add HTTP email connector

  The HTTP email connector allows you to send emails via HTTP call. To use the HTTP email connector, you'll need to have your own email service that expose an HTTP API for sending emails. Logto will call this API when it needs to send an email. For example, when a user registers, Logto will call the HTTP API to send a verification email.
