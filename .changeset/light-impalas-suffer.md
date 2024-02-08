---
"@logto/experience": minor
---

update user consent page to support the new third-party application feature

- Only show the user consent page if current application is a third-party application, otherwise auto-consent the requested scopes.
- Add the new fetching API to get the user consent context. Including the application detail, authenticated user info, all the requested scopes and user organizations info (if requested scopes include the organization scope).
- Add the new user consent interaction API and authorize button. User have to manually authorize the requested scopes for the third-party application before continue the authentication flow.
