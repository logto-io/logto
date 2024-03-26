---
"@logto/core": minor
---

support `first_screen` parameter in authentication request

Sign-in experience can be initiated with a specific screen by setting the `first_screen` parameter in the OIDC authentication request. This parameter is intended to replace the `interaction_mode` parameter, which is now deprecated.

The `first_screen` parameter can have the following values:

- `signIn`: The sign-in screen is displayed first.
- `register`: The registration screen is displayed first.

Here's a non-normative example of how to use the `first_screen` parameter:

```
GET /authorize?
  response_type=code
  &client_id=your_client_id
  &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
  &scope=openid
  &state=af0ifjsldkj
  &nonce=n-0S6_WzA2Mj
  &first_screen=signIn
```

When `first_screen` is set, the legacy `interaction_mode` parameter is ignored.
