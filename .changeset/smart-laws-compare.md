---
"@logto/console": minor
"@logto/phrases": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/integration-tests": patch
---

feature: just-in-time user provisioning for organizations

This feature allows users to automatically join the organization and be assigned roles upon their first sign-in through some authentication methods. You can set requirements to meet for just-in-time provisioning.

### Email domains

New users will automatically join organizations with just-in-time provisioning if they:

- Sign up with verified email addresses, or;
- Use social sign-in with verified email addresses.

This applies to organizations that have the same email domain configured.

To enable this feature, you can add email domain via the Management API or the Logto Console:

- We added the following new endpoints to the Management API:
  - `GET /organizations/{organizationId}/jit/email-domains`
  - `POST /organizations/{organizationId}/jit/email-domains`
  - `PUT /organizations/{organizationId}/jit/email-domains`
  - `DELETE /organizations/{organizationId}/jit/email-domains/{emailDomain}`
- In the Logto Console, you can manage email domains in the organization details page -> "Just-in-time provisioning" section.

### SSO connectors

New or existing users signing in through enterprise SSO for the first time will automatically join organizations that have just-in-time provisioning configured for the SSO connector.

To enable this feature, you can add SSO connectors via the Management API or the Logto Console:

- We added the following new endpoints to the Management API:
  - `GET /organizations/{organizationId}/jit/sso-connectors`
  - `POST /organizations/{organizationId}/jit/sso-connectors`
  - `PUT /organizations/{organizationId}/jit/sso-connectors`
  - `DELETE /organizations/{organizationId}/jit/sso-connectors/{ssoConnectorId}`
- In the Logto Console, you can manage SSO connectors in the organization details page -> "Just-in-time provisioning" section.

### Default organization roles

You can also configure the default roles for users provisioned via this feature. The default roles will be assigned to the user when they are provisioned.

To enable this feature, you can set the default roles via the Management API or the Logto Console:

- We added the following new endpoints to the Management API:
  - `GET /organizations/{organizationId}/jit/roles`
  - `POST /organizations/{organizationId}/jit/roles`
  - `PUT /organizations/{organizationId}/jit/roles`
  - `DELETE /organizations/{organizationId}/jit/roles/{organizationRoleId}`
- In the Logto Console, you can manage default roles in the organization details page -> "Just-in-time provisioning" section.
