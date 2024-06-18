# SMSAero short message service connector

The official Logto connector for SMSAero short message service.

**Table of contents**

- [SMSAero short message service connector](#smsaero-short-message-service-connector)
  - [Register account](#register-account)
  - [Get account credentials](#get-account-credentials)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test SMSAero connector](#test-smsaero-connector)
    - [Config types](#config-types)
  - [Reference](#reference)

## Register account

Create a new account on [SMSAero](https://smsaero.ru/). (Jump to the next step if you already have one.)

## Get account credentials

We will need the API credentials to make the connector work. Let's begin from
the [API and SMPP](https://smsaero.ru/cabinet/settings/apikey/).

Copy "API-key" or generate new one.

## Compose the connector JSON

Fill out the _email_, _apiKey_ and _senderName_ fields with your email, API key and sender name.

You can fill sender name with "SMSAero" to use default sender name provided by SMSAero.

You can add multiple SMS connector templates for different cases. Here is an example of adding a single template:

- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave `{{code}}` placeholder for
  random verification code.
- Fill out the `usageType` field with either `Register`, `SignIn`, `ForgotPassword`, `Generic` for different use cases.
  In order to enable full user flows, templates with usageType `Register`, `SignIn`, `ForgotPassword` and `Generic` are
  required.

### Test SMSAero connector

You can enter a phone number and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget
to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/enable-SMS-sign-in/).

### Config types

| Name       | Type        |
|------------|-------------|
| email      | string      |
| apiKey     | string      |
| senderName | string      |
| templates  | Templates[] |

| Template Properties | Type        | Enum values                                             |
|---------------------|-------------|---------------------------------------------------------|
| content             | string      | N/A                                                     |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |

## Reference

- [SMSAero API Documentation](https://smsaero.ru/integration/documentation/api/)
