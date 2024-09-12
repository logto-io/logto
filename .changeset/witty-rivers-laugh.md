---
"@logto/core": minor
---

enterprise SSO-only email identifier guard to the registration and profile fulfillment flow.

Bug fix:

Implement the missing SSO-only email identifier guard in the user registration and profile fulfillment flow.

- Creating a new user with a verification record containing an SSO-only email identifier should return a 422 `RequestError` with the error code `session.sso_required`.

- Updating a user profile with an SSO-only email identifier should return a 422 `RequestError` with the error code `session.sso_required`.
