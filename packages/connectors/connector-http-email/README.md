# HTTP email connector

The official Logto connector for HTTP email.

## Get started

The HTTP email connector allows you to send emails via HTTP call. To use the HTTP email connector, you'll need to have your own email service that expose an HTTP API for sending emails. Logto will call this API when it needs to send an email. For example, when a user registers, Logto will call the HTTP API to send a verification email.

## Set up HTTP email connector

To use the HTTP email connector, you need to set up an HTTP endpoint that Logto can call. And an optional authorization token for the endpoint.

## Payload

The HTTP email connector will send the following payload to the endpoint when it needs to send an email:

```json
{
  "to": "foo@logto.io",
  "type": "SignIn",
  "payload": {
    "code": "123456"
  }
}
```

You can find the type definition of `SendMessageData` in [connector-kit](../../toolkit/connector-kit/src/types/passwordless.ts).
