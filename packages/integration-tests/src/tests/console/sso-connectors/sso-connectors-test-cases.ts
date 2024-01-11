// Will extend this type definition later since we are going to configure the SSO connectors with specific values.
export type Protocol = 'SAML' | 'OIDC';

export type SsoConnectorTestCase = {
  connectorName: string;
  connectorFactoryName: string;
  protocol: Protocol;
  formData: Record<string, string>;
  previewResults: Record<string, string>;
};

const oidcFormData = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
};

const samlFormData = {
  // This is a real metadata URL from Microsoft Entra ID test application.
  metadataUrl:
    'https://login.microsoftonline.com/ac016212-4f8d-46c6-892c-57c90a255a02/federationmetadata/2007-06/federationmetadata.xml?appid=f562b098-dc8c-4e20-8c4b-ea55554fbd8c',
};

export const oidcPreviewResults = {
  'Authorization endpoint': 'https://accounts.google.com/o/oauth2/v2/auth',
  'Token endpoint': 'https://oauth2.googleapis.com/token',
  'User information endpoint': 'https://openidconnect.googleapis.com/v1/userinfo',
  'JSON web key set endpoint': 'https://www.googleapis.com/oauth2/v3/certs',
  Issuer: 'https://accounts.google.com',
};

export const samlPreviewResults = {
  'Sign on URL': 'https://login.microsoftonline.com/ac016212-4f8d-46c6-892c-57c90a255a02/saml2',
  Issuer: 'https://sts.windows.net/ac016212-4f8d-46c6-892c-57c90a255a02/',
  'Signing certificate': 'Expiring Sunday, October 25, 2026',
};

const microsoftEntraIdName = 'Microsoft Entra ID';
const microsoftEntraID: SsoConnectorTestCase = {
  connectorName: microsoftEntraIdName,
  connectorFactoryName: microsoftEntraIdName,
  protocol: 'SAML',
  formData: samlFormData,
  previewResults: samlPreviewResults,
};

const googleWorkspaceName = 'Google Workspace';
const googleWorkspace: SsoConnectorTestCase = {
  connectorName: googleWorkspaceName,
  connectorFactoryName: googleWorkspaceName,
  protocol: 'OIDC',
  formData: oidcFormData,
  previewResults: oidcPreviewResults,
};

const oktaName = 'Okta';
const okta: SsoConnectorTestCase = {
  connectorName: oktaName,
  connectorFactoryName: oktaName,
  protocol: 'OIDC',
  // Google Workspace connector have `issuer` predefined, for other OIDC-protocol-based connectors, we use Google's issuer to test the config fetcher and preview.
  formData: { ...oidcFormData, issuer: 'https://accounts.google.com' },
  previewResults: oidcPreviewResults,
};

const oidcName = 'OIDC';
const oidc: SsoConnectorTestCase = {
  connectorName: oidcName,
  connectorFactoryName: oidcName,
  protocol: 'OIDC',
  // Google Workspace connector have `issuer` predefined, for other OIDC-protocol-based connectors, we use Google's issuer to test the config fetcher and preview.
  formData: { ...oidcFormData, issuer: 'https://accounts.google.com' },
  previewResults: oidcPreviewResults,
};

const samlName = 'SAML';
const saml: SsoConnectorTestCase = {
  connectorName: samlName,
  connectorFactoryName: samlName,
  protocol: 'SAML',
  formData: samlFormData,
  previewResults: samlPreviewResults,
};

export const ssoConnectorTestCases: SsoConnectorTestCase[] = [
  microsoftEntraID,
  googleWorkspace,
  okta,
  oidc,
  saml,
];
