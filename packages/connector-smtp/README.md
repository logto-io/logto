# SMTP connector

The SMTP (Simple Mail Transfer Protocol) is an internet standard communication protocol for electronic mail transmission. Mail servers and other message transfer agents use SMTP to send and receive messages.

## Set up SMTP connector

SMTP is a transmission protocol that is not exclusive to some specific email service providers but can work with all providers.

We are now offering guides on how to use the SMTP connector to send emails following providers for your better understanding:
- _Gmail_ is the most popular email service vendor worldwide.
- _Aliyun direct mail_ and _SendGrid mail_. Some of you might be familiar with these two email service providers because Logto Team provided corresponding connectors; you will likely have a general idea of them.

We hope you can figure out all other email vendors' setups with the following examples :rocket:

### Set up for Gmail use

You can get a new Gmail account at [Gmail](https://mail.google.com/), or you can use an existing account if you have one.

A [Gmail official post](https://support.google.com/a/answer/176600) shows how to determine required properties' values to operate Gmail via an SMTP connector.

By following the post, your connector JSON should be like this:

```json
{
    "host": "smtp.gmail.com",
    "port": <port-number>,
    "username": "<your-gmail-address>",
    "password": "<password-to-previous-gmail-address>",
    "fromEmail": "<your-gmail-address>",
    "templates": [
        {
            "subject": "<register-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (regitser template)>",
            "usageType": "Register",
            "contentType": "text/plain"
        }
    ]
}
```

### Integrate with SendGrid SMTP API

Initially, we assume that you already have a SendGrid account. If not, create a new account at the [SendGrid website](https://app.sendgrid.com/).

You can find a step-by-step guide on [Integrating with the SMTP API](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api).

Developers can access _Verified senders' details_ on the [_Sender Management_ page](https://mc.sendgrid.com/senders).

After going through the guide, your connector JSON should look like this:

```json
{
    "host": "smtp.sendgrid.net",
    "port": 587,
    "username": "apiKey",
    "password": "<api-key-with-at-least-mail-permission>",
    "fromEmail": "<email-address-of-a-verified-sender>",
    "templates": [
        {
            "subject": "<register-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (regitser template)>",
            "usageType": "Register",
            "contentType": "text/plain"
        }
    ]
}
```

### Configure with Aliyun direct mail account

Sign in to the [Aliyun website](https://cn.aliyun.com/). Register a new account if you don't have one.

Follow the [Send emails using SMTP guide](https://www.alibabacloud.com/help/en/directmail/latest/send-emails-using-smtp) and finish those 'tasks' to get those required settings and information.

You can go to [SMTP service address page](https://www.alibabacloud.com/help/en/directmail/latest/smtp-service-address) to choose a proper SMTP service address host and port number.

To check _Sender Addresses_, you can find the entrance on the left-side navigation pane on [DirectMail console](https://dm.console.aliyun.com/). You should see `Sender address` and `SMTP Password` here.

After going through the guide, your connector JSON should look like this:

```json
{
    "host": "<SMTP-service-address>",
    "port": <port-number>,
    "username": "<email-address-of-chosen-sender-address>",
    "password": "<api-key-with-at-least-mail-permission>",
    "fromEmail": "<email-address-of-a-verified-sender-should-be-the-same-as-`username`>",
    "templates": [
        {
            "subject": "<register-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (regitser template)>",
            "usageType": "Register",
            "contentType": "text/plain"
        }
    ]
}
```

> **Note**
> Only one sample template is provided in the previous cases to keep things simple. You should add more templates for other use cases.
> You should change values wrapped with "<" and ">" according to your SendGrid or Aliyun account settings and choose to keep other fields w/o "<" and ">".

#### Config types

| Name      | Type       |
|-----------|------------|
| host      | string     |
| port      | string     |
| username  | string     |
| password  | string     |
| fromEmail | string     |
| templates | Template[] |

| Template Properties | Type        | Enum values                      |
|---------------------|-------------|----------------------------------|
| subject             | string      | N/A                              |
| content             | string      | N/A                              |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'Test' |
| contentType         | enum string | 'text/plain' \| 'text/html'      |

## References

- [Gmail - Send email from a printer, scanner, or app](https://support.google.com/a/answer/176600)
- [SendGrid - Integrating with the SMTP API](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Aliyun Direct Mail - Send emails using SMTP](https://www.alibabacloud.com/help/en/directmail/latest/send-emails-using-smtp)
- [Aliyun Direct Mail - SMTP Reference](https://www.alibabacloud.com/help/en/directmail/latest/smtp-reference)
