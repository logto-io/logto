# HTTP SMS connector

The official Logto connector for HTTP SMS.

## Get started

The HTTP SMS connector allows you to send SMS messages via HTTP call. To use the HTTP SMS connector, you'll need to have your own SMS service that exposes an HTTP API for sending SMS messages. Logto will call this API when it needs to send an SMS. For example, when a user registers, Logto will call the HTTP API to send a verification SMS.

## Set up HTTP SMS connector

To use the HTTP SMS connector, you need to set up an HTTP endpoint that Logto can call, and an optional authorization token for the endpoint.

> 💡 **Tip**
>
> Note that to prevent errors in authentication flow, the configured `endpoint` must return a 2xx response after receiving the webhook to inform Logto that it has received the notification to send the SMS.
>
> Meanwhile, in this scenario, you need to monitor SMS service to ensure successful SMS delivery. Alternatively, you can add monitoring to your SMS sending API to promptly detect SMS delivery failures.

## Payload

The HTTP SMS connector will send the following payload to the endpoint when it needs to send an SMS:

```json
{
  "to": "+1234567890",
  "type": "SignIn",
  "payload": {
    "code": "123456"
  }
}
```

You can find all of the types in https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/configure-popular-sms-service/#sms-template, and the full type definition of `SendMessageData` in [connector-kit](https://github.com/logto-io/logto/tree/master/packages/toolkit/connector-kit/src/types/passwordless.ts). 
