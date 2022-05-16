```json
{
  "apiKey": "apikey",
  "fromEmail": "noreply@logto.test.io",
  "templates": [
    {
      "usageType": "SignIn",
      "type": "ContextType.TEXT",
      "subject": "Logto SignIn Template",
      "content": "This is for sign-in purposes only. Your passcode is {{code}}.",
    },
    {
      "usageType": "Register",
      "type": "ContextType.TEXT",
      "subject": "Logto Register Template",
      "content": "This is for registering purposes only. Your passcode is {{code}}.",
    },
    {
      "usageType": "Test",
      "type": "ContextType.TEXT",
      "subject": "Logto Test Template",
      "content": "This is for testing purposes only. Your passcode is {{code}}.",
    }
  ]
}
```
