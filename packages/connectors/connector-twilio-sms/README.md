# Twilio short message service connector

The official Logto connector for Twilio short message service.

**Table of contents**

- [Twilio short message service connector](#twilio-short-message-service-connector)
  - [Get started](#get-started)
  - [Register Twilio account](#register-twilio-account)
  - [Set up senders' phone numbers](#set-up-senders-phone-numbers)
  - [Get account credentials](#get-account-credentials)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [API host](#api-host)
    - [Ireland (IE1) setup](#ireland-ie1-setup)
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

### API host

The optional `host` field selects the Twilio API hostname. When omitted, it defaults to `api.twilio.com`.

Enter a hostname, **not a full URL**. It must start with `api.`, end with `.twilio.com`, and contain only DNS labels made of ASCII letters, digits, and internal hyphens. Labels may contain up to 63 characters, and the hostname up to 253 characters. Hostnames are case-insensitive. Schemes (`https://`), ports, paths, credentials, whitespace, queries, and fragments are not accepted.

Requests use `https://{host}/2010-04-01/Accounts/{accountSID}/Messages.json`. When a host is configured, the connector does not follow redirects or fall back to another host on failure.

### Ireland (IE1) setup

1. Set `host` to `api.dublin.ie1.twilio.com`. Only the Dublin edge supports Messaging in IE1.
2. Keep your `accountSID` and use the **IE1-specific Auth Token** as `authToken`. US1 credentials cannot be reused. This connector uses Account SID / Auth Token authentication, not API key authentication. See [Twilio API authentication](https://www.twilio.com/docs/messaging/api#authentication).
3. Create a Messaging Service in IE1 and set its SID as `fromMessagingServiceSID`. Messaging Services are region-isolated; a US1 service cannot be used in IE1.
4. Add compatible senders to that service. Phone number senders must be configured for IE1; supported alphanumeric sender IDs can also be used. IE1 does not support short codes or sending to/from `+1` numbers.

The connector omits `RiskCheck` for IE1, where SMS Pumping Protection is unavailable. `disableRiskCheck` has no effect for IE1; other hosts retain the existing risk-check behavior. See the [regional setup guide](https://www.twilio.com/docs/global-infrastructure/messaging-api-with-twilio-regions) and [IE1 feature availability](https://www.twilio.com/docs/global-infrastructure/messaging-eu-feature-availability).

Use **Send** before saving to validate your regional credentials, Messaging Service, and sender with a compatible recipient, then verify delivery in Twilio's IE1 Messaging Logs. Automated connector tests mock Twilio responses and do not establish live IE1 delivery.

Selecting IE1 does not guarantee that the entire SMS flow stays in the EU. Twilio's [SMS EU data residency](https://www.twilio.com/docs/global-infrastructure/sms-eu-data-residency) scope ends at handoff to telecommunications providers, which may process data outside the EU. Your Logto and application deployments must also be considered.

### Test Twilio SMS connector

You can enter a phone number and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/enable-SMS-sign-in/).

### Config types

| Name                    | Type               |
| ----------------------- | ------------------ |
| accountSID              | string             |
| authToken               | string             |
| fromMessagingServiceSID | string             |
| host                    | string (optional)  |
| disableRiskCheck        | boolean (optional) |
| templates               | Templates[]        |

| Template Properties | Type        | Enum values                                             |
| ------------------- | ----------- | ------------------------------------------------------- |
| content             | string      | N/A                                                     |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |

## Reference

- [Twilio - Error and Warning Dictionary](https://www.twilio.com/docs/api/errors)
