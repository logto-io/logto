# Twilio short message service connector

The official Logto connector for Twilio short message service.

**Table of contents**

- [Twilio short message service connector](#twilio-short-message-service-connector)
  - [Get started](#get-started)
  - [Register Twilio account](#register-twilio-account)
  - [Set up senders' phone numbers](#set-up-senders-phone-numbers)
  - [Get account credentials](#get-account-credentials)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test Twilio SMS connector](#test-twilio-sms-connector)
    - [Config types](#config-types)
  - [Reference](#reference)

## Get started

Twilio provides programmable communication tools for making and receiving phone calls, sending and receiving text messages, and other communication functions. We can send the "verification code" text messages through its web service APIs.

## Register Twilio account

Create a new account on [Twilio](https://www.twilio.com). (Jump to the next step if you already have one.)

## Set up senders' phone numbers

Go to the [Twilio console page](https://console.twilio.com/) and sign in with your Twilio account.

Purchase a phone number under "Phone Numbers" -> "Manage" -> "Buy a number".

> ℹ️ **Tip**
>
> Sometimes you may encounter the situation that SMS service is not supported in specific countries or areas. Pick a number from other regions to bypass.

Once we have a valid number claimed, nav to the "Messaging" -> "Services". Create a new Message Service by clicking on the button.

Give a friendly service name and choose _Notify my users_ as our service purpose.
Following the next step, choose `Phone Number` as _Sender Type_, and add the phone number we just claimed to this service as a sender.

> ℹ️ **Note**
>
> Each phone number can only be linked with one messaging service.

## Get account credentials

We will need the API credentials to make the connector work. Let's begin from the [Twilio console page](https://console.twilio.com/).

Click on the "Account" menu in the top-right corner, then go to the "API keys & tokens" page to get your `Account SID` and `Auth token`.

Back to "Messaging" -> "Services" settings page starting from the sidebar, and find the `Sid` of your service.

## Compose the connector JSON

Fill out the _accountSID_, _authToken_ and _fromMessagingServiceSID_ fields with `Account SID`, `Auth token` and `Sid` of the corresponding messaging service.

You can add multiple SMS connector templates for different cases. Here is an example of adding a single template:

- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave `{{code}}` placeholder for random verification code.
- Fill out the `usageType` field with either `Register`, `SignIn`, `ForgotPassword`, `Generic` for different use cases. In order to enable full user flows, templates with usageType `Register`, `SignIn`, `ForgotPassword` and `Generic` are required.

### Test Twilio SMS connector

You can enter a phone number and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/enable-SMS-sign-in/).

### Config types

| Name                    | Type        |
|-------------------------|-------------|
| accountSID              | string      |
| authToken               | string      |
| fromMessagingServiceSID | string      |
| templates               | Templates[] |

| Template Properties | Type        | Enum values                                          |
|---------------------|-------------|------------------------------------------------------|
| content             | string      | N/A                                                  |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |

## Reference

- [Twilio - Error and Warning Dictionary](https://www.twilio.com/docs/api/errors)
