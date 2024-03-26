---
"@logto/demo-app": minor
---

carry over search params to the authentication request

When entering the Logto demo app with search parameters, if the user is not authenticated, the search parameters are now carried over to the authentication request. This allows manual testing of the OIDC authentication flow with specific parameters.
