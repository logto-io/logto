---
"@logto/core": patch
---

prevent user registration and profile fulfillment with SSO-only email domains

Emails associated with SSO-enabled domains should only be used through the SSO authentication process.

Bug fix:

- Creating a new user with a verification record that contains an SSO-only email domain should return a 422 `RequestError` with the error code `session.sso_required`.
- Updating a user profile with an SSO-only email domain should return a 422 `RequestError` with the error code `session.sso_required`.
