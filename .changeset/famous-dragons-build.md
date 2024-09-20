---
"@logto/connector-http-email": minor
---

add HTTP email connector

The HTTP email connector allows you to send emails via HTTP call. To use the HTTP email connector, you'll need to have your own email service that expose an HTTP API for sending emails. Logto will call this API when it needs to send an email. For example, when a user registers, Logto will call the HTTP API to send a verification email.
