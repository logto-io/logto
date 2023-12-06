---
"@logto/core": minor
---

Support single sign-on (SSO) on Logto.

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
