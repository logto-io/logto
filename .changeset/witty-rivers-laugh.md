---
"@logto/core": minor
---

add enterprise SSO only email identifier guard on the registraction and profile fulfillment flow.

Bug fix:

Add the missing SSO only email identifier guard on the user registration and profile fulfillment flow.

- Create new user with verification record that contains SSO only email identifier should return 422 `RequestError` with error code `session.sso_enabled`.

- Update user profile with SSO only email identifier should return 422 `RequestError` with error code `session.sso_enabled`.
