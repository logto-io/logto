# Twilio short message service connector

Twilio provides programmable communication tools for making and receiving phone calls, sending and receiving text messages, and performing other communication functions using its web service APIs. We can take advantage of its sending text message function to send a "verification code" (or in other words, passcode).

## Register and sign in Twilio account

Go to https://www.twilio.com to register a new account and sign in to Twilio afterward. You may skip the registration step if you've already got an account.

## Set up sender's phone numbers

Go to the [Twilio console page](https://console.twilio.com/) and sign in with your Twilio account.

Switch to _Develop_ tab on the top of the sidebar, and then unfold _Phone Numbers_ and _Messaging_.

Click _Buy a number_ under _Phone Numbers_ -> _Manage_, and you can buy phone number(s) as your sender's phone number.

Go to _Messaging_ -> _Services_ and click _Create Messaging Service_ button on the top-right corner of the panel.
    1. Name your messaging service and type in the name in _Messaging Service friendly name_ field. Choose the proper purpose, in our case, is `Notify my users`.
    2. Go to _Add Senders_, choose `Phone Number` as _Sender Type_, and continue. Select the sender you want to link to the messaging service that is currently being created and move on by clicking _Add Phone Numbers_. Need to notice that a phone number (or sender) can only be bound to one messaging service.

## Get account credentials

Starting from the [Twilio console page](https://console.twilio.com/), go to the _API keys & tokens_ page from _Account_ in the top-right corner, and you can find `Account SID` and `Auth token` at the bottom of the page.

Back to the [Twilio console page](https://console.twilio.com/), and go along path _Messaging_ -> _Services_ from the sidebar. Messaging services' `Sid`s are shown in the second column in the table.

## Compose the connector JSON

Fill out the _accountSID_, _authToken_ and _fromMessagingServiceSID_ fields with `Account SID`, `Auth token` and `Sid` of the corresponding messaging service.

You can add multiple SMS connector templates for different cases. Here is an example of adding a single template:
    - Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave `{{code}}` placeholder for random passcode.
    - Fill out `usageType` field with either `Register`, `SignIn` or `Test` for different use cases.

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

