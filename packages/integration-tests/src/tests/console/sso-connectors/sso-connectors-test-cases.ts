import { logtoIssuer, metadataXml } from '#src/__mocks__/sso-connectors-mock.js';

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
  issuer: logtoIssuer,
};

const samlFormData = {
  metadata: metadataXml,
};

export const oidcPreviewResults = {
  'Authorization endpoint': `${logtoIssuer}/auth`,
  'Token endpoint': `${logtoIssuer}/token`,
  'User information endpoint': `${logtoIssuer}/me`,
  'JSON web key set endpoint': `${logtoIssuer}/jwks`,
  Issuer: logtoIssuer,
};

const oidcName = 'OIDC';

const oidc: SsoConnectorTestCase = {
  connectorName: oidcName,
  connectorFactoryName: oidcName,
  protocol: 'OIDC',
  // To avoid external dependencies we use local logtoOidcUrl as the issuer for all the OIDC based connectors.
  formData: { ...oidcFormData },
  previewResults: oidcPreviewResults,
};

// These values are decoded from the metadataXml string.
export const samlPreviewResults = {
  'Sign on URL': 'https://login.microsoftonline.com/ac016212-4f8d-46c6-892c-57c90a255a02/saml2',
  Issuer: 'https://sts.windows.net/ac016212-4f8d-46c6-892c-57c90a255a02/',
  'Signing certificate': 'Expiring Sunday, October 25, 2026',
};

const samlName = 'SAML';
const saml: SsoConnectorTestCase = {
  connectorName: samlName,
  connectorFactoryName: samlName,
  protocol: 'SAML',
  formData: samlFormData,
  previewResults: samlPreviewResults,
};

export const ssoConnectorTestCases: SsoConnectorTestCase[] = [oidc, saml];
