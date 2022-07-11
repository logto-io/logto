# Twilio short message service connector

Twilio provides programmable communication tools for making and receiving phone calls, sending and receiving text messages, and other communication functions. We can send the "verification code" text messages through its web service APIs.

## Register Twilio account

Create a new account on [Twilio](https://www.twilio.com). (Jump to the next step if you already have one.)

## Set up senders' phone numbers

Go to the [Twilio console page](https://console.twilio.com/) and sign in with your Twilio account.

Purchase a phone number under _Phone Numbers_ -> _Manage_ -> **_Buy a number_**.

Once we have a valid number claimed, nav to the _Messaging_ -> **_Services_**. Create a new Message Service by clicking on the button.

Give a friendly service name and choose **_Notify my users_** as our service purpose.
Following the next step, choose `Phone Number` as _Sender Type_, and link the phone number we just claimed to this service.

> ℹ️ **Note**
>
> Each phone number can only be linked with one messaging service.

## Get account credentials

We will need the API credentials to make the connector work. Let's begin from the [Twilio console page](https://console.twilio.com/).

Click on the _Account_ menu in the top-right corner, then go to the _API keys & tokens_ page to get your `Account SID` and `Auth token`.

Back to _Messaging_ -> _Services_ settings page starting from the sidebar, and find the `Sid` of your service.

## Compose the connector JSON

Fill out the _accountSID_, _authToken_ and _fromMessagingServiceSID_ fields with `Account SID`, `Auth token` and `Sid` of the corresponding messaging service.

You can add multiple SMS connector templates for different cases. Here is an example of adding a single template:

- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave `{{code}}` placeholder for random passcode.
- Fill out the `usageType` field with either `Register`, `SignIn` or `Test` for different use cases.

Here is an example of Twilio SMS connector config JSON.

```json
{
    "accountSID": "<your-account-sid>",
    "authToken": "<your-auth-token>",
    "fromMessagingServiceSID": "<messaging-service-sid>",
    "templates": [
        {
            "content": "<arbitrary-register-template-contents: your passcode is {{code}}>",
            "usageType": "Register"
        },
        {
            "content": "<arbitrary-sign-in-template-contents: your passcode is {{code}}>",
            "usageType": "SignIn"
        },
        {
            "content": "<arbitrary-test-template-contents: your passcode is {{code}}>",
            "usageType": "Test"
        }
    ]
}
```


### Config types

| Name                    | Type        |
|-------------------------|-------------|
| accountSID              | string      |
| authToken               | string      |
| fromMessagingServiceSID | string      |
| templates               | Templates[] |

| Template Properties | Type        | Enum values                      |
|---------------------|-------------|----------------------------------|
| content             | string      | N/A                              |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'Test' |

