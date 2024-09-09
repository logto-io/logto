---
"@logto/console": minor
"@logto/core": minor
---

add access deny method to the custom token claims script

Introduce a new `api` parameter to the custom token claims script. This parameter is used to provide more access control context over the token exchange process.
Use `api.denyAccess()` to reject the token exchange request. Use this method to implement your own access control logics.

```javascript
const getCustomJwtClaims: async ({ api }) => {
  // Reject the token request, with a custom error message
  api.denyAccess('Access denied');
}
```
