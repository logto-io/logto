---
"@logto/core": patch
---

fix Microsoft EntraID OIDC SSO connector invalid authorization code response bug

- For public organizations access EntraID OIDC applications, the token endpoint returns `expires_in` value type in number.
- For private organization access only applications, the token endpoint returns `expires_in` value type in string.
- Expected `expires_in` value type is number. (See [v2-oauth2-auth-code-flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#successful-response-2) for reference)

String type `expires_in` value is not supported by the current Microsoft EntraID OIDC connector, a invalid authorization response error will be thrown.
Update the token response guard to handle both number and string type `expires_in` value. Make the SSO connector more robust.
