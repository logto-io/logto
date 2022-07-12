# SendGrid mail connector

SendGrid (a.k.a. Twilio SendGrid) is a customer communication platform for transactional and marketing email. We can use its email sending function to send a "verification code".

## Register SendGrid account

Create a new account at [SendGrid website](https://app.sendgrid.com/). You may skip this step if you've already got an account.

## Verify senders

Go to the [SendGrid console page](https://app.sendgrid.com/) and sign in with your SendGrid account.

Senders indicate the addresses our verification code email will be sent from. In order to send emails via the SendGrid mail server, you need to verify at least one sender.

Starting from the [SendGrid console page](https://app.sendgrid.com/), go to _Settings_ -> _Sender Authentication_ from the sidebar.

Domain Authentication is recommended but not obligatory. You can click _Get Started_ in _Authenticate Your Domain_ card and follow the upcoming guide to link and verify a sender to SendGrid.

By clicking the _Verify a Single Sender_ button in the panel, you are now focusing on a form requiring some critical information to create a sender. Follow the guide, fill out all these fields, and hit the _Create_ button.

After the single sender is created, an email with a verification link should be sent to your sender's email address. Go to your mailbox, find the verification mail and finish verifying the single sender by clicking the link given in the email. You can now send emails via SendGrid connector using the sender you've just verified.

## Create API keys

Let's start from the [SendGrid console page](https://app.sendgrid.com/), go to _Settings_ -> _API Keys_ from the sidebar.

Click the _Create API Key_ in the top-right corner of the API Keys page. Type in the name of the API key and customize _API Key Permission_ per your use case. A global `Full Access` or `Restricted Access` with full access to Mail Send is required before sending emails with this API key.

The API Key is presented to you on the screen as soon as you finished the _Create API Key_ process. You should save this API Key somewhere safe because this is the only chance that you can see it.

## Compose the connector JSON

Fill out the `apiKey` field with the API Key created in **Create API keys** section.

Fill out the `fromEmail` and `fromName` fields with the senders' _From Address_ and _Nickname_. You can find the sender's details on the [_Sender Management_ page](https://mc.sendgrid.com/senders).

You can add multiple SendGrid mail connector templates for different cases. Here is an example of adding a single template:

- Fill out the `subject` field, which works as the title of emails.
- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave the `{{code}}` placeholder for the random passcode.
- Fill out `usageType` field with either `Register`, `SignIn` or `Test` for different use cases.
- Fill out `type` field with either `text/plain` or `text/html` for different types of content.


Here is an example of Aliyun DM connector config JSON.

```json
{
    "apiKey": "<your-api-key>",
    "fromEmail": "<noreply@logto.io>",
    "fromName": "<logto>",
    "templates": [
        {
            "subject": "<register-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (regitser template)>",
            "usageType": "Register",
            "type": "text/plain"
        },
        {
            "subject": "<sign-in-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (sign-in template)>",
            "usageType": "SignIn",
            "type": "text/plain"
        },
        {
            "subject": "<test-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (test template)>",
            "usageType": "Test",
            "type": "text/plain"
        },
    ]
}
```

### Config types

| Name      | Type       |
|-----------|------------|
| apiKey    | string     |
| fromEmail | string     |
| fromName  | string     |
| templates | Template[] |

| Template Properties | Type        | Enum values                      |
|---------------------|-------------|----------------------------------|
| subject             | string      | N/A                              |
| content             | string      | N/A                              |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'Test' |
| type                | enum string | 'text/plain' \| 'text/html'      |
