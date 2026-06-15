---
"@logto/console": minor
"@logto/core": minor
"@logto/experience": minor
"@logto/phrases-experience": minor
"@logto/phrases": minor
"@logto/integration-tests": minor
"@logto/schemas": minor
---

add app-level access control for applications

Add a new application access control feature that allows administrators to restrict user access to applications. When enabled, users who do not have permission to access an application will see an access denied error message when they attempt to sign in or access the application. This feature can be configured in the Console Security settings.

Supported custom control rules include:

- User IDs
- User roles
- Organizations
- Organization roles

Refer to the documentation for more details: https://docs.logto.io/integrate-logto/app-level-access-control
