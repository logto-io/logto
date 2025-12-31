---
"@logto/schemas": minor
"@logto/core": minor
"@logto/console": minor
"@logto/phrases": minor
"@logto/integration-tests": minor
---

support token exchange grant type with app-level control

- Add `allowTokenExchange` field to `customClientMetadata` to control whether an application can initiate token exchange requests
- Existing first-party applications will have this enabled by default (via database alteration)
- New M2M and Traditional Web applications will have this enabled by default
- New SPA and Native applications will have this disabled by default
- Third-party applications are not allowed to use token exchange
- Add UI toggle in Console with risk warning for public clients (single-page application / native application)
