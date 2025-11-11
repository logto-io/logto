---
"@logto/integration-tests": minor
"@logto/experience": minor
"@logto/core": minor
---

support cross-app authentication callbacks within the same browser session

When multiple applications are initiating authentication requests within the same browser session,
authentication callbacks may interfere with each other due to the shared `_interaction` cookie.

To resolve this, we now change the cookie from a plain UID string to a structured mapping object
`{ [app_id]: interaction_uid }`, and maintain the `app_id` in either the URL search parameters or HTTP
headers for all authentication-related requests and redirects. This ensures that each application can
correctly identify its own authentication context without interference from others.

The fallback mechanism is also implemented to ensure backward compatibility.
