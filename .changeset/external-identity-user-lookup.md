---
"@logto/core": minor
---

support looking up users by external identity in the Management API

`GET /api/users` now accepts `identityType`, `identityProvider`, and `identityId` query parameters for exact user lookup. Use `identityType=social` with a connector target (such as `dingtalk`), or `identityType=sso` with an enterprise SSO issuer, together with the user identifier issued by the external provider. The identity filter is combined with other search filters using AND logic
