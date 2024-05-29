---
"@logto/connector-github": patch
---

fix `GET /users/emails` API requests break social sign-in flow error

Previously, the GET /users/emails API was returning a 403 Forbidden error when the endpoint is not accessible. This will break the social sign-in flow in previous version, so we handled this error and return an empty array instead. In this way, the social sign-in flow will continue but with `userEmails` as an empty array, and should provide enough information for further investigation.
