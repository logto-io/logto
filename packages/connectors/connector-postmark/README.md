# Postmark connector

Logto connector for Postmark email service.

## Get started

Postmark is a mail platform for transactional and marketing email. We can use its email sending function to send a _verification code_.

## Register Postmark account

Create a new account at [Postmark website](https://postmark.com/). You may skip this step if you've already got an account.

## Configure your connector

Fill out the `serverToken` field with the Server Token you find under settings for your
server in Postmark.

Fill out the `fromEmail` field with the senders' _From Address_. 

In order to enable full user flows, templates with usageType `Register`, `SignIn`, `ForgotPassword` and `Generic` are required

Here is an example of Postmark connector template JSON.

```jsonc
[
    {
        "usageType": "Register",
        "templateAlias": "logto-register"
    },
    {
        "usageType": "SignIn",
        "templateAlias": "logto-sign-in"
    },
    {
        "usageType": "ForgotPassword",
        "templateAlias": "logto-forgot-password"
    },
    {
        "usageType": "Generic",
        "templateAlias": "logto-generic"
    },
]
```

## Test Postmark email connector

You can type in an email address and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/passwordless-sign-in-by-adding-connectors#enable-sms-or-email-passwordless-sign-in)

## Config types

| Name        | Type              |
|-------------|-------------------|
| serverToken | string            |
| fromEmail   | string            |

| Template Properties | Type        | Enum values                                          |
|---------------------|-------------|------------------------------------------------------|
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |
| templateAlias       | string      | N/A                                                  |
