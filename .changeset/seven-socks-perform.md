---
"@logto/schemas": patch
---

## Fix third-party app get /interaction/consent 500 bug

### Steps to reproduce

1. Create a organization scope with empty description, add assign the scope to a third-party app
2. Sign in the third-party app and request for the organization scope
3. Follow the interaction flow till the consent page
4. A internal server error 500 is returned

### Root cause

For the get /interaction/consent endpoint, organization scope is returned with other resource scopes in the `missingResourceScopes` property.

In the `consentInfoResponseGuard`, we use the resource `Scopes` zod guard to validate the `missingResourceScopes` property. However, the description field in resource scope is required. A organization scope with empty description will fail the validation.

### Fix

Update the `consentInfoResponseGuard`'s missingResourceScopes property. Use the organization scope zod guard which does not require the description field.

The alignment of the resource scope and organization scope type will be handled in the next release.
