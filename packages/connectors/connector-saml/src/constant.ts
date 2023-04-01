import type { ConnectorConfigFormItem, ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const formItems: ConnectorConfigFormItem[] = [
  {
    type: ConnectorConfigFormItemType.Text,
    label: 'SP Entity ID (Audience)',
    key: 'entityID',
    required: true,
    description:
      'The application-defined unique identifier that is the intended audience of the SAML assertion. This is most often the SP Entity ID of your application.',
  },
  {
    type: ConnectorConfigFormItemType.Text,
    label: 'IdP Single Sign-On URL',
    key: 'signInEndpoint',
    required: true,
  },
  {
    type: ConnectorConfigFormItemType.MultilineText,
    label: 'X.509 Certificate',
    key: 'x509Certificate',
    required: true,
    placeholder:
      '-----BEGIN CERTIFICATE-----\nMIIDHTCCAgWg[...]jel7/YMPLKwg+Iau7\n-----END CERTIFICATE-----',
    description:
      'The certificate is provided by the IdP, and will be used to validate the signature of the SAML assertion.',
  },
  {
    type: ConnectorConfigFormItemType.MultilineText,
    label: "IdP's Metadata in XML format",
    key: 'idpMetadataXml',
    required: true,
  },
  {
    type: ConnectorConfigFormItemType.Text,
    label: 'Assertion Consumer Service URL',
    key: 'assertionConsumerServiceUrl',
    required: true,
    description:
      'Copy and paste the unique Assertion Consumer Service URL (ACS URL) into the {{Connector Name}} provider configuration. It will take effect after the connector is created.',
  },
  {
    type: ConnectorConfigFormItemType.Select,
    label: 'Signature Algorithm',
    key: 'requestSignatureAlgorithm',
    selectItems: [
      { value: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1', title: 'RSA SHA1' },
      {
        value: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
        title: 'RSA SHA256',
      },
      {
        value: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512',
        title: 'RSA SHA512',
      },
    ],
    defaultValue: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
  },
  {
    type: ConnectorConfigFormItemType.Select,
    label: 'Message Signing Order',
    key: 'messageSigningOrder',
    selectItems: [
      { value: 'sign-then-encrypt', title: 'Sign then encrypt' },
      {
        value: 'encrypt-then-sign',
        title: 'Encrypt then sign',
      },
    ],
    defaultValue: 'sign-then-encrypt',
  },
  {
    type: ConnectorConfigFormItemType.Switch,
    label: 'Sign Authentication Request',
    key: 'signAuthnRequest',
    defaultValue: false,
  },
  {
    type: ConnectorConfigFormItemType.MultilineText,
    label: 'Signature Private Key',
    key: 'privateKey',
    required: true,
    showConditions: [{ targetKey: 'signAuthnRequest', expectValue: true }],
    placeholder:
      '-----BEGIN RSA PRIVATE KEY-----\n[private-key-content]\n-----END RSA PRIVATE KEY-----',
    description: 'The private key is used to sign the authentication request.',
  },
  {
    type: ConnectorConfigFormItemType.Text,
    label: 'Signature Private Key Password',
    key: 'privateKeyPass',
    showConditions: [{ targetKey: 'signAuthnRequest', expectValue: true }],
  },
  {
    type: ConnectorConfigFormItemType.Switch,
    label: 'SAML Assertion Encrypted',
    key: 'encryptAssertion',
    defaultValue: false,
  },
  {
    type: ConnectorConfigFormItemType.MultilineText,
    label: 'Decryption Private Key',
    key: 'encPrivateKey',
    required: true,
    showConditions: [{ targetKey: 'encryptAssertion', expectValue: true }],
    placeholder:
      '-----BEGIN RSA PRIVATE KEY-----\n[private-key-content]\n-----END RSA PRIVATE KEY-----',
  },
  {
    type: ConnectorConfigFormItemType.Text,
    label: 'Decryption Private Key Password',
    key: 'encPrivateKeyPass',
    showConditions: [{ targetKey: 'encryptAssertion', expectValue: true }],
    description: 'The private key is used to decrypt the encrypted SAML assertion.',
  },
  {
    type: ConnectorConfigFormItemType.Select,
    label: 'Name ID Format',
    key: 'nameIDFormat',
    selectItems: [
      { value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified', title: 'Unspecified' },
      {
        value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        title: 'EmailAddress',
      },
      {
        value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName',
        title: 'x590SubjectName',
      },
      {
        value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
        title: 'Persistent',
      },
      {
        value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
        title: 'Transient',
      },
    ],
    defaultValue: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    description:
      "Identifies the SAML processing rules and constraints for the assertion's subject statement. Use the default value of 'Unspecified' unless the application explicitly requires a specific format.",
  },
  {
    type: ConnectorConfigFormItemType.Number,
    label: 'Timeout',
    key: 'timeout',
    defaultValue: 5000,
  },
  {
    type: ConnectorConfigFormItemType.Json,
    label: 'Profile Mapping',
    key: 'profileMap',
    defaultValue: {
      id: 'id',
      email: 'email',
      phone: 'phone',
      name: 'name',
      avatar: 'avatar',
    },
    required: false,
  },
];

export const defaultMetadata: ConnectorMetadata = {
  id: 'saml',
  target: 'saml',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'SAML',
    'zh-CN': 'SAML',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'SAML is an XML based framework that stands for Security Assertion Markup Language. It can be used for authentication.',
    'zh-CN':
      '安全断言标记语言 SAML 是一个基于 XML 的开源标准数据格式，它可用于在当事方之间交换身份验证和授权数据。',
  },
  readme: './README.md',
  isStandard: true,
  formItems,
};

export const defaultTimeout = 10_000;

export const authnRequestBinding = ['HTTP-Redirect'] as const;

export const assertionBinding = ['HTTP-POST'] as const;

export const messageSigningOrders = ['sign-then-encrypt', 'encrypt-then-sign'] as const;
