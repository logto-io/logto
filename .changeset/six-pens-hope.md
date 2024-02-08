---
"@logto/core": minor
---

implement Logto core API to support the new third-party application feature, and user consent interaction flow

### Management API

- Add new endpoint `/applications/sign-in-experiences` with `PUT`, `GET` methods to manage the application level sign-in experiences.
- Add new endpoint `/applications/:id/users/:userId/consent-organizations` with `PUT`, `GET`, `POST`, `DELETE` methods to manage the user granted organizations for the third-party application.
- Add new endpoint `/applications/:id/user-consent-scopes` with `GET`, `POST`, `DELETE` methods to manage the user consent resource, organization, and user scopes for the third-party application.
- Update the `/applications` endpoint to include the new `is_third_party` field. Support create third-party applications, and query by `is_third_party` field.

### Interaction API

- Add the `koaAutoConsent` to support the auto-consent interaction flow for the first-party application. If is the first-party application we can auto-consent the requested scopes. If is the third-party application we need to redirect the user to the consent page to get the user consent manually.
- Add the `GET /interaction/consent` endpoint to support fetching the consent context for the user consent page. Including the application detail, authenticated user info, all the requested scopes and user organizations info (if requested scopes include the organization scope).
- Update the `POST /interaction/consent` endpoint to support the user consent interaction flow. Including grant all the missing scopes, and update the user granted organizations for the third-party application.
