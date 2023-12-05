---
"@logto/console": minor
"@logto/core": minor
"@logto/experience": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

Introduce new enterpeise single sign-on (SSO) feature to Logto.

## @logto/console

- Implement new enterprise SSO management pages. Allow create and manage SSO connectors through Logto console.
- Add enabled/disable SSO toggle switch on the sign-in-experience settings page.

## @logto/core

- Implement new SSO connector management APIs.

  - `GET /api/sso-connector-providers` - List all the supported SSO connector providers.
  - `POST /api/sso-connectors` - Create new SSO connector.
  - `GET /api/sso-connectors` - List all the SSO connectors.
  - `GET /api/sso-connectors/:id` - Get SSO connector by id.
  - `PATCH /api/sso-connectors/:id` - Update SSO connector by id.
  - `DELETE /api/sso-connectors/:id` - Delete SSO connector by id.

- Implement new SSO interaction APIs to enable the SSO connector sign-in methods

  - `POST /api/interaction/single-sign-on/:connectorId/authorization-url` - Init a new SSO connector sign-in interaction flow by retrieving the IdP's authorization URL.
  - `POST /api/interaction/single-sign-on/:connectorId/authentication` - Handle the SSO connector sign-in interaction flow by retrieving the IdP's authentication data.
  - `POST /api/interaction/single-sign-on/:connectorId/registration` - Create new user account by using the SSO IdP's authentication result.
  - `GET /api/interaction/single-sign-on/connectors` - List all the enabled SSO connectors by a given email address.

- Implement new SSO connector factory to support different SSO connector providers.
  - `OIDC` - Standard OIDC connector that can be used to connect with any OIDC compatible IdP.
  - `SAML` - Standard SAML 2.0 connector that can be used to connect with any SAML 2.0 compatible IdP.
  - `AzureAD` - Azure Active Directory connector that can be used to connect with Azure AD.
  - `Okta` - Okta connector that can be used to connect with Okta.
  - `Google Workspace` - Google Workspace connector that can be used to connect with Google Workspace.

## @logto/experience

Implement the new SSO sign-in flow

- /single-sign-on/email - The SSO email form page for user to enter their email address.
- /single-sign-on/connectors - The SSO connectors page for user to select the enabled SSO connector they want to use.
- Implement the email identifier guard on all the sign-in and registration identifier forms. If the email address is enabled with SSO, redirect user to the SSO flow.

## @logto/phrases

Add new phrases for the new SSO feature.

## @logto/schemas

- Add new sso_connectors table, which is used to store the SSO connector data.
- Add new user_sso_identities table, which is used to store the user's SSO identity data received from IdP through a SSO interaction.
- Add new single_sign_on_enabled column to the sign_in_experiences table, which is used to indicate if the SSO feature is enabled for the sign-in experience.
