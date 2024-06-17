# SendGrid email connector

The official Logto connector for SendGrid email service.

**Table of contents**

- [SendGrid email connector](#sendgrid-email-connector)
  - [Get started](#get-started)
  - [Register SendGrid account](#register-sendgrid-account)
  - [Verify senders](#verify-senders)
  - [Create API keys](#create-api-keys)
  - [Configure your connector](#configure-your-connector)
    - [Test SendGrid email connector](#test-sendgrid-email-connector)
    - [Config types](#config-types)

## Get started

SendGrid (i.e. Twilio SendGrid) is a customer communication platform for transactional and marketing email. We can use its email sending function to send a _verification code_.

## Register SendGrid account

Create a new account at [SendGrid website](https://app.sendgrid.com/). You may skip this step if you've already got an account.

## Verify senders

Go to the [SendGrid console page](https://app.sendgrid.com/) and sign in with your SendGrid account.

Senders indicate the addresses our verification code email will be sent from. In order to send emails via the SendGrid mail server, you need to verify at least one sender.

Starting from the [SendGrid console page](https://app.sendgrid.com/), go to "Settings" -> "Sender Authentication" from the sidebar.

Domain Authentication is recommended but not obligatory. You can click "Get started" in "Authenticate Your Domain" card and follow the upcoming guide to link and verify a sender to SendGrid.

By clicking the "Verify a Single Sender" button in the panel, you are now focusing on a form requiring some critical information to create a sender. Follow the guide, fill out all these fields, and hit the "Create" button.

After the single sender is created, an email with a verification link should be sent to your sender's email address. Go to your mailbox, find the verification mail and finish verifying the single sender by clicking the link given in the email. You can now send emails via SendGrid connector using the sender you've just verified.

## Create API keys

Let's start from the [SendGrid console page](https://app.sendgrid.com/), go to "Settings" -> "API Keys" from the sidebar.

Click the "Create API Key" in the top-right corner of the API Keys page. Type in the name of the API key and customize "API Key Permission" per your use case. A global `Full Access` or `Restricted Access` with full access to Mail Send is required before sending emails with this API key.

The API Key is presented to you on the screen as soon as you finished the _Create API Key_ process. You should save this API Key somewhere safe because this is the only chance that you can see it.

## Configure your connector

Fill out the `apiKey` field with the API Key created in "Create API keys" section.

Fill out the `fromEmail` and `fromName` fields with the senders' _From Address_ and _Nickname_. You can find the sender's details on the ["Sender Management" page](https://mc.sendgrid.com/senders). `fromName` is OPTIONAL, so you can skip filling it.

You can add multiple SendGrid mail connector templates for different cases. Here is an example of adding a single template:

- Fill out the `subject` field, which works as the title of emails.
- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave the `{{code}}` placeholder for the random verification code.
- Fill out `usageType` field with either `Register`, `SignIn`, `ForgotPassword`, `Generic` for different use cases.
- Fill out `type` field with either `text/plain` or `text/html` for different types of content.

In order to enable full user flows, templates with usageType `Register`, `SignIn`, `ForgotPassword` and `Generic` are required.

Here is an example of SendGrid connector template JSON.

```jsonc
[
    {
        "subject": "<register-template-subject>",
        "content": "<Logto: Your verification code is {{code}}. (register template)>",
        "usageType": "Register",
        "type": "text/plain"
    },
    {
        "subject": "<sign-in-template-subject>",
        "content": "<Logto: Your verification code is {{code}}. (sign-in template)>",
        "usageType": "SignIn",
        "type": "text/plain"
    },
    {
        "subject": "<forgot-password-template-subject>",
        "content": "<Logto: Your verification code is {{code}}. (forgot-password template)>",
        "usageType": "ForgotPassword",
        "type": "text/plain"
    },
    {
        "subject": "<generic-template-subject>",
        "content": "<Logto: Your verification code is {{code}}. (generic template)>",
        "usageType": "Generic",
        "type": "text/plain",
    },
]
```

### Test SendGrid email connector

You can type in an email address and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/email-connector/enable-email-sign-in/)

### Config types

| Name      | Type              |
|-----------|-------------------|
| apiKey    | string            |
| fromEmail | string            |
| fromName  | string (OPTIONAL) |
| templates | Template[]        |

| Template Properties | Type        | Enum values                                          |
|---------------------|-------------|------------------------------------------------------|
| subject             | string      | N/A                                                  |
| content             | string      | N/A                                                  |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |
| type                | enum string | 'text/plain' \| 'text/html'                          |
