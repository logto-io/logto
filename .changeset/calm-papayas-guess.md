---
"@logto/schemas": minor
"@logto/core": minor
---

feat: support custom scope in the social verification API.

This change allows developers to specify a custom `scope` parameter in the create social verification request. If a scope is provided, it will be used to generate the authorization URI; otherwise, the default scope configured in the connector will be used.

- Affected endpoints:
  - `POST /api/verifications/social`
