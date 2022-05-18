```json
{
  "accountSID": "<account-sid>",
  "authToken": "<auth-token>",
  "fromMessagingServiceSID": "<from-messaging-service-sid>",
  "templates": [
    {
      "usageType": "SignIn",
      "type": "plain/text",
      "subject": "Logto SignIn Template",
      "content": "This is for sign-in purposes only. Your passcode is {{code}}.",
    },
    {
      "usageType": "Register",
      "type": "plain/text",
      "subject": "Logto Register Template",
      "content": "This is for registering purposes only. Your passcode is {{code}}.",
    },
    {
      "usageType": "Test",
      "type": "plain/text",
      "subject": "Logto Test Template",
      "content": "This is for testing purposes only. Your passcode is {{code}}.",
    }
  ]
}
```
