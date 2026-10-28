---
"@logto/core": patch
---

answer `connector.authorization_failed` when the user declines the social provider's authorization

A user who declines the consent screen or cancels at the social provider used to get a generic `connector.general` error whose message was the raw callback parameters, for most social connectors.

The callback is now checked before the connector runs, on every social sign-in, verification and account linking path: when it carries `error=access_denied` (OAuth 2.0 / OpenID Connect), `user_cancelled_authorize` (Sign in with Apple, LinkedIn) or `user_cancelled_login` (LinkedIn), the request is answered with a 401 `connector.authorization_failed` that carries the provider's `error` and `error_description`. Other provider error codes keep reaching the connector, which surfaces the provider's description as before.
