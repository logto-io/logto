---
"@logto/connector-http-email": minor
"@logto/connector-http-sms": minor
"@logto/connector-kit": minor
"@logto/core": minor
---

add client IP address to passwordless connector message payload

The `SendMessageData` type now includes an optional `ip` field that contains the client IP address of the user who triggered the message. This can be used by HTTP email/SMS connectors for rate limiting, fraud detection, or logging purposes.
