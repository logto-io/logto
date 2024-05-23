---
"@logto/core": patch
---

fix Microsoft EntraID OIDC SSO connector invalid authorization code response bug

- For public organizations access EntraID OIDC applications, the token endpoint returns `expires_in` value type in number.
- For private organization access only applications, the token endpoint returns `expires_in` value type in string.

String type `expires_in` value is not supported by the OIDC connector, a invalid authorization response error will be thrown.
Update the token response guard to handle both number and string type `expires_in` value. Make the SSO connector more robust.
