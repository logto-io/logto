---
"@logto/core": patch
---

answer `connector.authorization_failed` when the social provider returns an error response

A user who declines the consent screen or cancels at the social provider comes back to the callback with `error=access_denied` (and, on Microsoft Entra ID for instance, an `error_description`). Most connectors only validate the success shape of the callback, so such a callback failed their parameter guard and surfaced as a generic `connector.general` error whose message was the raw callback parameters.

The standard OAuth 2.0 / OpenID Connect error response is now recognized before the connector runs, for every social connector and on every entry point (sign-in and profile verification, account social linking, management API social linking): the request is answered with a 401 `connector.authorization_failed` that carries the provider's `error` and `error_description`.
