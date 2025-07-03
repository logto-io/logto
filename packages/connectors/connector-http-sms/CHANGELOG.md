# @logto/connector-http-sms

## 1.0.0

### Minor Changes

- add HTTP SMS connector

    The HTTP SMS connector allows you to send SMS messages via HTTP call. To use the HTTP SMS connector, you'll need to have your own SMS service that exposes an HTTP API for sending SMS messages. Logto will call this API when it needs to send an SMS. For example, when a user registers, Logto will call the HTTP API to send a verification SMS. 