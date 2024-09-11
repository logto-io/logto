---
"@logto/core": minor
"@logto/integration-tests": patch
---

add password policy checking api

Add `POST /api/sign-in-exp/default/check-password` API to check if the password meets the password policy configured in the default sign-in experience. A user ID is required for this API if rejects user info is enabled in the password policy.

Here's a non-normative example of the request and response:

```http
POST /api/sign-in-exp/default/check-password
Content-Type: application/json

{
  "password": "123",
  "userId": "some-user-id"
}
```

```http
400 Bad Request
Content-Type: application/json

{
  "result": false,
  "issues": [
    { "code": "password_rejected.too_short" },
    { "code": "password_rejected.character_types" },
    { "code": "password_rejected.restricted.sequence" }
  ]
}
```
