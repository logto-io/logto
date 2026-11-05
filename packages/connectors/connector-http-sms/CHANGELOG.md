# @logto/connector-http-sms

## 0.2.2

### Patch Changes

- d89e507: support Node.js 26

  Logto and the published packages now declare support for Node.js 22, 24 and 26. The minimum supported versions are 22.23.4, 24.22.1 and 26.12.1, which include the October 2026 Node.js security fixes.

- Updated dependencies [800eb13]
- Updated dependencies [d89e507]
- Updated dependencies [9d7d323]
- Updated dependencies [664e6ac]
- Updated dependencies [05678f9]
  - @logto/connector-kit@5.2.0

## 0.2.1

### Patch Changes

- Updated dependencies [4e25126228]
- Updated dependencies [4e25126228]
  - @logto/connector-kit@5.0.0

## 0.2.0

### Minor Changes

- 7c87ebc068: add client IP address to passwordless connector message payload

  The `SendMessageData` type now includes an optional `ip` field that contains the client IP address of the user who triggered the message. This can be used by HTTP email/SMS connectors for rate limiting, fraud detection, or logging purposes.

### Patch Changes

- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @logto/connector-kit@4.7.0

## 0.1.0

### Minor Changes

- e4182c6856: add SMS http connector
