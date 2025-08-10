# Generic HTTP SMS Connector

Welcome to the generic Logto connector for any third-party SMS service! This tool lets you connect Logto to your preferred SMS provider with a simple HTTP endpoint.

## **Let's Get You Started**

This connector is designed to be super flexible. It works by sending an HTTP request to an endpoint you provide. Whenever Logto needs to send an SMS—like a verification code for a new user, a password reset, or a sign-in notification—it will send a **webhook** to your API. Your service then receives this webhook and handles the actual message delivery to the user's phone. This allows you to integrate with virtually any SMS provider that has a web-based API.

## **Setting Up Your Connector**

To get this connector working, you'll need to provide a few key pieces of information. Think of it as giving Logto a map to your SMS service's front door!

### **Configuration Options**

- **Endpoint**: This is the full URL of your API endpoint that handles sending SMS messages. For example, `https://api.your-sms-provider.com/send`.
- **Method**: Just let us know whether your endpoint needs a `GET` or `POST` request. The method you choose will determine how the message data is sent.
- **Authorization** (Optional): If your API requires an authorization token (e.g., an API key), you can pop it in here. Logto will automatically add it to the `Authorization` header for you.
- **Headers** (Optional): Need to send any extra headers, such as `Content-Type: application/json`? No problem! Just provide them as a JSON object.
- **Query Parameters** (Optional): For `GET` requests, you can configure the data that will be appended to the URL as query parameters.
- **Body Parameters** (Optional): For `POST` requests, you can build the JSON body that your API expects.

Feel free to use placeholders like `{{to}}`, `{{type}}`, and `{{message}}` in your configuration. They'll be replaced with dynamic information for each message!

> 💡 Friendly Tip
>
>
> To keep the authentication flow running smoothly, your endpoint needs to send back a successful `2xx` response when it receives the request. This lets Logto know that the message has been successfully handed off. For peace of mind, we recommend having a monitoring system in place to ensure your messages are actually delivered!
>

## **How It Works: Dynamic Placeholders**

The connector will automatically swap out special placeholders with real data when it's time to send an SMS.

| **Placeholder** | **Description** |
| --- | --- |
| `{{to}}` | The phone number of the person receiving the message (e.g., `+1234567890`). This always includes the country code. |
| `{{type}}` | The purpose of the message (e.g., `SignIn`, `Register`, `ResetPassword`). |
| `{{message}}` | The actual content of the SMS (like a verification code). |

For example, if you're using a `POST` request, your body might look something like this:

```json
{
  "recipient": "{{to}}",
  "text_content": "Hello! Your verification code for Logto is: {{message}}"
}

```

Or, for a `GET` request, you could set up your query parameters like this:

```json
{
  "to": "{{to}}",
  "message": "{{message}}"
}

```

This would generate a URL that looks something like this: `https://your-api.com/send-sms?to=+1234567890&message=123456`.

If you're curious about all the different message types, you can check them out in the Logto documentation. The full `SendMessageData` type definition is also available in the [connector-kit](https://github.com/logto-io/logto/tree/master/packages/toolkit/connector-kit/src/types/passwordless.ts) repository.