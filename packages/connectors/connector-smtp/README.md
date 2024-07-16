# SMTP connector

The official Logto connector for SMTP.

**Table of contents**

- [SMTP connector](#smtp-connector)
  - [Get started](#get-started)
  - [Set up SMTP connector](#set-up-smtp-connector)
    - [Set up for Gmail use](#set-up-for-gmail-use)
    - [Integrate with SendGrid SMTP API](#integrate-with-sendgrid-smtp-api)
    - [Configure with Aliyun direct mail account](#configure-with-aliyun-direct-mail-account)
    - [Test SMTP connector](#test-smtp-connector)
    - [Config types](#config-types)

## Get started

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

### Integrate with SendGrid SMTP API

Initially, we assume that you already have a SendGrid account. If not, create a new account at the [SendGrid website](https://app.sendgrid.com/).

You can find a step-by-step guide on ["Integrating with the SMTP API"](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api).

Developers can access _sender_ details on the ["Sender Management"](https://mc.sendgrid.com/senders).

### Configure with Aliyun direct mail account

Sign in to the [Aliyun website](https://cn.aliyun.com/). Register a new account if you don't have one.

Follow the [Send emails using SMTP guide](https://www.alibabacloud.com/help/en/directmail/latest/send-emails-using-smtp) and finish those 'tasks' to get those required settings and information.

You can go to [SMTP service address page](https://www.alibabacloud.com/help/en/directmail/latest/smtp-service-address) to choose a proper SMTP service address host and port number.

To check "Sender Addresses", you can find the entrance on the left-side navigation pane on [DirectMail console](https://dm.console.aliyun.com/). You should see `Sender address` and `SMTP Password` here.

> ℹ️ **Note**
>
> Only one sample template is provided in the previous cases to keep things simple. You should add more templates for other use cases.
> You should change values wrapped with "<" and ">" according to your Gmail, SendGrid or Aliyun account settings and choose to keep other fields w/o "<" and ">".
> Add `{{code}}` as a placeholder in templates' content to show random verification code in sending emails.

### Test SMTP connector

You can type in an email address and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/email-connector/enable-email-sign-in/).

### Config types

| Name      | Type       |
|-----------|------------|
| host      | string     |
| port      | string     |
| fromEmail | string     |
| templates | Template[] |

| Template Properties | Type        | Enum values                                          |
|---------------------|-------------|------------------------------------------------------|
| subject             | string      | N/A                                                  |
| content             | string      | N/A                                                  |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |
| contentType         | enum string | 'text/plain' \| 'text/html'                          |

**Username and password Auth Options**

| Name | Type                   | Enum values |
|------|------------------------|-------------|
| user | string                 | N/A         |
| pass | string                 | N/A         |
| type | enum string (OPTIONAL) | 'login'     |

You can also configure [OAuth2 Auth Options](https://nodemailer.com/smtp/oauth2/) and other advanced configurations. See [here](https://nodemailer.com/smtp/) for more details.

We gave an example config with all configurable parameters in the text box to help you to set up own configuration. (You are responsible to the configuration, some values are for demonstration purpose and may not fit your use case.)
