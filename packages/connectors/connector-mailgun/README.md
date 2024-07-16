# Mailgun email connector

The official Logto connector for Mailgun email service.

**Table of contents**

- [Mailgun email connector](#mailgun-email-connector)
  - [Prerequisites](#prerequisites)
  - [Basic configuration](#basic-configuration)
  - [Deliveries](#deliveries)
    - [Config object](#config-object)
    - [Usage types](#usage-types)
    - [Content config](#content-config)
    - [Example](#example)
  - [Test Mailgun email connector](#test-mailgun-email-connector)

## Prerequisites

- A [Mailgun](https://www.mailgun.com/) account
- An API key from your Mailgun account, requires the permission to send messages (emails). See [Where Can I Find My API Key and SMTP Credentials?](https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials-) for more information.

## Basic configuration

- Fill out the `endpoint` field when you are using a different Mailgun API endpoint, for example, EU region should be `https://api.eu.mailgun.net`. The default value is `https://api.mailgun.net`.
- Fill out the `domain` field with the domain you have registered in your Mailgun account. This value can be found in the **Domains** section of the Mailgun dashboard. The domain should be in the format `example.com`, without the `https://` or `http://` prefix.
- Fill out the `apiKey` field with the API key you have generated in your Mailgun account.
- Fill out the `from` field with the email address you want to send emails from. This email address must be registered in your Mailgun account. The email address should be in the format `Sender Name <sender@example.com>`.

## Deliveries

### Config object

The "Deliveries" section allows you to configure the content of the emails to be sent in different scenarios. It is a JSON key-value map where the key is the usage type and the value is an object containing the content config for the email to be sent.

```json
{
  "<usage-type>": {
    // ...
  }
}
```

### Usage types

The following usage types are supported:

- `Register`: The email to be sent when a user is registering.
- `SignIn`: The email to be sent when a user is signing in.
- `ForgotPassword`: The email to be sent when a user is resetting their password.
- `Generic`: The email to be sent when a user is performing a generic action, for example, testing the email connector.

> **Note**
> If the usage type is not specified in the deliveries config, the generic email will be sent. If the generic email is not specified, the connector will return an error.

### Content config

The connector supports both direct HTML content and Mailgun template. You can use one of them for each usage type.

In both subject and content, you can use the `{{code}}` placeholder to insert the verification code.

To use direct HTML content, fill out the following fields:

- `subject`: The subject of the email to be sent.
- `replyTo`: The email address to be used as the reply-to address.
- `html`: (Required) The HTML content of the email to be sent.
- `text`: The plain text version of the email to be sent.

To use Mailgun template, fill out the following fields:

- `subject`: The subject of the email to be sent.
- `replyTo`: The email address to be used as the reply-to address.
- `template`: (Required) The name of the Mailgun template to be used.
- `variables`: The variables to be passed to the Mailgun template. Should be a JSON key-value map since it will be stringified before sending to Mailgun. Note there's no need to include the `code` variable since it will be automatically added by the connector.

### Example

The following is an example of the deliveries config:

```json
{
  "Register": {
    "subject": "{{code}} is your verification code",
    "replyTo": "Foo <foo@bar.com>",
    "html": "<h1>Welcome to Logto</h1><p>Your verification code is {{code}}.</p>",
    "text": "Welcome to Logto. Your verification code is {{code}}."
  },
  "SignIn": {
    "subject": "Welcome back to Logto",
    "replyTo": "Foo <foo@bar.com>",
    "template": "logto-sign-in",
    "variables": {
      "bar": "baz"
    }
  }
}
```

## Test Mailgun email connector

You can type in an email address and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/email-connector/enable-email-sign-in/)
