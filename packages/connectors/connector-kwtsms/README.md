# kwtSMS connector

The official Logto connector for [kwtSMS](https://www.kwtsms.com/), an SMS gateway in Kuwait.

**Table of contents**

- [kwtSMS connector](#kwtsms-connector)
  - [Register account](#register-account)
  - [Get API credentials](#get-api-credentials)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test kwtSMS connector](#test-kwtsms-connector)
    - [Config types](#config-types)
  - [Reference](#reference)

## Register account

Create an account at [kwtSMS](https://www.kwtsms.com/). (Jump to the next step if you already have one.)

## Get API credentials

Open the API settings of your kwtSMS account and enable the API. Copy the **API username** and **API password**. The API username is issued separately: it is not your mobile number or your account login.

## Compose the connector JSON

Fill out the `username` and `password` fields with your API credentials.

`senderId` is optional and defaults to `KWT-SMS`. `KWT-SMS` is a shared Sender ID meant for testing only (delivery is throttled). Register a private Sender ID in your kwtSMS account and enter it here for production.

`testMode` defaults to `false`. Turn it on only while you set up: in test mode the gateway queues the message but never delivers it and still answers `OK`, so no verification code reaches the user. The credits for a queued test message are held until you delete it from the queue in your kwtSMS account.

You can add multiple SMS connector templates for different cases. Here is an example of adding a single template:

- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave the `{{code}}` placeholder for the random verification code.
- Fill out the `usageType` field with either `Register`, `SignIn`, `ForgotPassword` or `Generic` for different use cases. In order to enable full user flows, templates with usageType `Register`, `SignIn`, `ForgotPassword` and `Generic` are required.

Phone numbers are sent as digits only (a leading `+` or `00`, spaces and dashes are removed). Messages that contain emoji have the emoji removed. Messages with Arabic text are sent as Unicode and use shorter segments (70 characters instead of 160).

### Test kwtSMS connector

You can enter a phone number and click on "Send" to see whether the settings work before "Save and Done". With `testMode` on, a successful test only confirms the gateway accepted the request.

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/enable-SMS-sign-in/).

### Config types

| Name      | Type        | Default   |
| --------- | ----------- | --------- |
| username  | string      |           |
| password  | string      |           |
| senderId  | string      | `KWT-SMS` |
| testMode  | boolean     | `false`   |
| templates | Templates[] |           |

| Template Properties | Type        | Enum values                                             |
| ------------------- | ----------- | ------------------------------------------------------- |
| content             | string      | N/A                                                     |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |

## Reference

[kwtSMS API documentation](https://www.kwtsms.com/api-documentation.html)
