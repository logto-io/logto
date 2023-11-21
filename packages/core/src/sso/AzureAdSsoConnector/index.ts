import { SsoProviderName } from '@logto/schemas';

import { SamlSsoConnector } from '../SamlSsoConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { samlConnectorConfigGuard } from '../types/saml.js';

export class AzureAdSsoConnector extends SamlSsoConnector {}

export const azureAdSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.AZURE_AD> = {
  providerName: SsoProviderName.AZURE_AD,
  logo: 'https://logtoeu.blob.core.windows.net/public-blobs/risa4g/aAYaRZOiGoxS/2023/09/03/zqdr28er/azure.png',
  description: {
    en: 'This connector is used to connect with Azure AD Single Sign-On.',
  },
  configGuard: samlConnectorConfigGuard,
  constructor: AzureAdSsoConnector,
};
