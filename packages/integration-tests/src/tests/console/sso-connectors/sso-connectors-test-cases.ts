// Will extend this type definition later since we are going to configure the SSO connectors with specific values.
export type SsoConnectorTestCase = {
  connectorName: string;
  connectorFactoryName: string;
};

const microsoftEntraIdName = 'Microsoft Entra ID';
const microsoftEntraID: SsoConnectorTestCase = {
  connectorName: microsoftEntraIdName,
  connectorFactoryName: microsoftEntraIdName,
};

const googleWorkspaceName = 'Google Workspace';
const googleWorkspace: SsoConnectorTestCase = {
  connectorName: googleWorkspaceName,
  connectorFactoryName: googleWorkspaceName,
};

const oktaName = 'Okta';
const okta: SsoConnectorTestCase = {
  connectorName: oktaName,
  connectorFactoryName: oktaName,
};

const oidcName = 'OIDC';
const oidc: SsoConnectorTestCase = {
  connectorName: oidcName,
  connectorFactoryName: oidcName,
};

const samlName = 'SAML';
const saml: SsoConnectorTestCase = {
  connectorName: samlName,
  connectorFactoryName: samlName,
};

export const ssoConnectorTestCases: SsoConnectorTestCase[] = [
  microsoftEntraID,
  googleWorkspace,
  okta,
  oidc,
  saml,
];
