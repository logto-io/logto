---
"@logto/schemas": minor
"@logto/core": minor
"@logto/console": minor
"@logto/phrases": minor
"@logto/integration-tests": minor
---

support token exchange grant type with app-level control

- Add `allowTokenExchange` field to `customClientMetadata` to control whether an application can initiate token exchange requests
- Machine-to-machine applications now support token exchange
- All new applications will have token exchange disabled by default, you can enable it in the application settings
- For backward compatibility, existing first-party Traditional, Native, and SPA applications will have this enabled
- Third-party applications are not allowed to use token exchange
- Add UI toggle in Console with risk warning for public clients (single-page application / native application)
