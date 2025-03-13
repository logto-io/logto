---
"@logto/core": patch
---

remove `client_id` from OIDC SSO connector's token request body for better compatibility

This updates addresses an issue with client authentication methods in the token request process. Previously, the `client_id` was included in the request body while also using the authentication header for client credentials authentication.

This dual method of client authentication can lead to errors with certain OIDC providers, such as Okta, which only support one authentication method at a time.

### Key changes

Removal of `client_id` from request body: The `client_id` parameter has been removed from the token request body. According to the [OAuth 2.0 specification](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3), `client_id` in the body is required only for public clients.
