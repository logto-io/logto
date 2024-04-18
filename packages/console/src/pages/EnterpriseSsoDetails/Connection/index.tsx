import { SsoProviderType, type SsoConnectorWithProviderConfig } from '@logto/schemas';

import { type OidcSsoConnectorWithProviderConfig } from '../types/oidc';
import { type SamlSsoConnectorWithProviderConfig } from '../types/saml';

import OidcConnectorForm from './OidcConnectorForm';
import SamlConnectorForm from './SamlConnectorForm';

type Props = {
  readonly isDeleted: boolean;
  readonly data: SsoConnectorWithProviderConfig;
  readonly onUpdated: (data: SsoConnectorWithProviderConfig) => void;
};

function isSamlProviderData(
  data: SsoConnectorWithProviderConfig
): data is SamlSsoConnectorWithProviderConfig {
  return data.providerType === SsoProviderType.SAML;
}

function isOidcProviderData(
  data: SsoConnectorWithProviderConfig
): data is OidcSsoConnectorWithProviderConfig {
  return data.providerType === SsoProviderType.OIDC;
}

function Connection({ isDeleted, data, onUpdated }: Props) {
  if (isSamlProviderData(data)) {
    return <SamlConnectorForm isDeleted={isDeleted} data={data} onUpdated={onUpdated} />;
  }

  if (isOidcProviderData(data)) {
    return <OidcConnectorForm isDeleted={isDeleted} data={data} onUpdated={onUpdated} />;
  }

  return null;
}

export default Connection;
