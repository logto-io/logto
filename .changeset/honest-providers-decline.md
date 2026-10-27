---
"@logto/core": patch
---

answer `connector.authorization_failed` when the user declines the social provider's authorization

A user who declines the consent screen or cancels at the social provider comes back to the callback with `error=access_denied` (and, on Microsoft Entra ID for instance, an `error_description`). Most connectors only validate the success shape of the callback, so such a callback failed their parameter guard and surfaced as a generic `connector.general` error whose message was the raw callback parameters.

The standard `access_denied` error response (OAuth 2.0 / OpenID Connect) is now recognized before the connector runs, for every social connector and on every entry point (sign-in and profile verification, account social linking, management API social linking): the request is answered with a 401 `connector.authorization_failed` that carries the provider's `error` and `error_description`. Other provider error codes keep reaching the connector, which surfaces the provider's description as before.
