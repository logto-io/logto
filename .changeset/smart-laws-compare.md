---
"@logto/console": minor
"@logto/phrases": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/integration-tests": patch
---

feature: just-in-time user provisioning for organizations

This feature allows organizations to provision users when signing up with their email address or being added by Management API.

### Email domains

If the user's verified email domain matches one of the organization's configured domains, the user will be automatically provisioned to the organization.

To enable this feature, you can add email domain via the Management API or the Logto Console:

- We added the following new endpoints to the Management API:
  - `GET /organizations/{organizationId}/jit/email-domains`
  - `POST /organizations/{organizationId}/jit/email-domains`
  - `PUT /organizations/{organizationId}/jit/email-domains`
  - `DELETE /organizations/{organizationId}/jit/email-domains/{emailDomain}`
- In the Logto Console, you can manage email domains in the organization details page -> "Just-in-time provisioning" section.

### Default organization roles

You can also configure the default roles for users provisioned via this feature. The default roles will be assigned to the user when they are provisioned.

To enable this feature, you can set the default roles via the Management API or the Logto Console:

- We added the following new endpoints to the Management API:
  - `GET /organizations/{organizationId}/jit/roles`
  - `POST /organizations/{organizationId}/jit/roles`
  - `PUT /organizations/{organizationId}/jit/roles`
  - `DELETE /organizations/{organizationId}/jit/roles/{organizationRoleId}`
- In the Logto Console, you can manage default roles in the organization details page -> "Just-in-time provisioning" section.
