---
"@logto/core-kit": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/phrases-experience": patch
"@logto/integration-tests": patch
---

full oidc standard claims support

We have added support for the remaining [OpenID Connect standard claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims). Now, these claims are accessible in both ID tokens and the response from the `/me` endpoint.

Additionally, we adhere to the standard scopes - claims mapping. This means that you can retrieve most of the profile claims using the `profile` scope, and the `address` claim can be obtained by using the `address` scope.

For all newly introduced claims, we store them in the `user.profile` field.

> ![Note]
> Unlike other database fields (e.g. `name`), the claims stored in the `profile` field will fall back to `undefined` rather than `null`. We refrain from using `?? null` here to reduce the size of ID tokens, since `undefined` fields will be stripped in tokens.
