---
"@logto/schemas": patch
---

## Resolve Third-Party App's /interaction/consent Endpoint 500 Error

### Reproduction Steps

- Establish an organization scope with an empty description and assign this scope to a third-party application.

- Login to the third-party application and request the organization scope.

- Proceed through the interaction flow until reaching the consent page.

- An internal server error 500 is returned.

### Root Cause

For the /interaction/consent endpoint, the organization scope is returned alongside other resource scopes in the missingResourceScopes property.

In the consentInfoResponseGuard, we utilize the resource Scopes zod guard to validate the missingResourceScopes property. However, the description field in the resource scope is mandatory while organization scopes'description is optional. An organization scope with an empty description will not pass the validation.

### Solution

Modify the consentInfoResponseGuard's missingResourceScopes property. Use the organization scope zod guard which does not necessitate the description field.

The alignment of the resource scope and organization scope types will be addressed in the next release.
