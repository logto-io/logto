// Will extend this type definition later since we are going to configure the SSO connectors with specific values.
export type Protocol = 'SAML' | 'OIDC';

export type SsoConnectorTestCase = {
  connectorName: string;
  connectorFactoryName: string;
  protocol: Protocol;
};

const microsoftEntraIdName = 'Microsoft Entra ID';
const microsoftEntraID: SsoConnectorTestCase = {
  connectorName: microsoftEntraIdName,
  connectorFactoryName: microsoftEntraIdName,
  protocol: 'SAML',
};

const googleWorkspaceName = 'Google Workspace';
const googleWorkspace: SsoConnectorTestCase = {
  connectorName: googleWorkspaceName,
  connectorFactoryName: googleWorkspaceName,
  protocol: 'OIDC',
};

const oktaName = 'Okta';
const okta: SsoConnectorTestCase = {
  connectorName: oktaName,
  connectorFactoryName: oktaName,
  protocol: 'OIDC',
};

const oidcName = 'OIDC';
const oidc: SsoConnectorTestCase = {
  connectorName: oidcName,
  connectorFactoryName: oidcName,
  protocol: 'OIDC',
};

const samlName = 'SAML';
const saml: SsoConnectorTestCase = {
  connectorName: samlName,
  connectorFactoryName: samlName,
  protocol: 'SAML',
};

export const ssoConnectorTestCases: SsoConnectorTestCase[] = [
  microsoftEntraID,
  googleWorkspace,
  okta,
  oidc,
  saml,
];
