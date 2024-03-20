---
"@logto/schemas": patch
---

## Resolve third-party app's /interaction/consent endpoint 500 error

### Reproduction steps

- Create an organization scope with an empty description and assign this scope to a third-party application.

- Login to the third-party application and request the organization scope.

- Proceed through the interaction flow until reaching the consent page.

- An internal server error 500 is returned.

### Root cause

For the `/interaction/consent` endpoint, the organization scope is returned alongside other resource scopes in the `missingResourceScopes` property.

In the `consentInfoResponseGuard`, we utilize the resource Scopes zod guard to validate the `missingResourceScopes` property. However, the description field in the resource scope is mandatory while organization scopes'description is optional. An organization scope with an empty description will not pass the validation.

### Solution

Alter the resource scopes table to make the description field nullable. Related Scope zod guard and the consentInfoResponseGuard will be updated to reflect this change. Align the resource scopes table with the organization scopes table to ensure consistency.
