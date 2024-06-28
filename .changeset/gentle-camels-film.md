---
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
"@logto/schemas": minor
"@logto/integration-tests": patch
---

support machine-to-machine apps for organizations

This feature allows machine-to-machine apps to be associated with organizations, and be assigned with organization roles.

### Console

- Add a new "machine-to-machine" type to organization roles. All existing roles are now "user" type.
- You can manage machine-to-machine apps in the organization details page -> Machine-to-machine apps section.
- You can view the associated organizations in the machine-to-machine app details page.

### OpenID Connect grant

The `client_credentials` grant type is now supported for organizations. You can use this grant type to obtain an access token for an organization.

### Management API

A set of new endpoints are added to the Management API:

- `/api/organizations/{id}/applications` to manage machine-to-machine apps.
- `/api/organizations/{id}/applications/{applicationId}` to manage a specific machine-to-machine app in an organization.
- `/api/applications/{id}/organizations` to view the associated organizations of a machine-to-machine app.
