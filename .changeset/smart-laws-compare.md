---
"@logto/console": minor
"@logto/phrases": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/integration-tests": patch
---

feature: just-in-time user provisioning for organizations

This feature allows organizations to provision users when signing up with their email address or being added by Management API. If the user's email domain matches one of the organization's configured domains, the user will be automatically provisioned to the organization.

To enable this feature, you can add email domain via the Management API or the Logto Console:

- We added the following new endpoints to the Management API:
  - `GET /organizations/{organizationId}/email-domains`
  - `POST /organizations/{organizationId}/email-domains`
  - `PUT /organizations/{organizationId}/email-domains`
  - `DELETE /organizations/{organizationId}/email-domains/{emailDomain}`
- In the Logto Console, you can manage email domains in the organization details page -> "Just-in-time provisioning" section.
