# @logto/connector-http-sms

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
