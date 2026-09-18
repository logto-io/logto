import {
  SsoProviderType,
  type SsoConnectorWithProviderConfig,
  type JsonObject,
} from '@logto/schemas';
import { type ReactNode } from 'react';

import { type OidcSsoConnectorWithProviderConfig } from '../types/oidc';
import { type SamlSsoConnectorWithProviderConfig } from '../types/saml';

import OidcConnectorForm from './OidcConnectorForm';
import SamlConnectorForm from './SamlConnectorForm';

type ConnectionData = Omit<SsoConnectorWithProviderConfig, 'tenantId' | 'createdAt' | 'domains'>;

type Props = {
  readonly isDeleted: boolean;
  readonly data: ConnectionData;
  readonly onUpdated?: (data: ConnectionData) => void;
  readonly onSave?: (config: JsonObject) => Promise<void>;
  readonly oidcServiceProviderInfo?: ReactNode;
  readonly isSigningKeyManagementEnabled?: boolean;
  readonly isDomainSelectionEnabled?: boolean;
};

function isSamlProviderData(data: ConnectionData): data is SamlSsoConnectorWithProviderConfig {
  return data.providerType === SsoProviderType.SAML;
}

function isOidcProviderData(data: ConnectionData): data is OidcSsoConnectorWithProviderConfig {
  return data.providerType === SsoProviderType.OIDC;
}

function Connection({
  isDeleted,
  data,
  onUpdated,
  onSave,
  oidcServiceProviderInfo,
  isSigningKeyManagementEnabled,
  isDomainSelectionEnabled,
}: Props) {
  if (isSamlProviderData(data)) {
    return (
      <SamlConnectorForm
        isDeleted={isDeleted}
        data={data}
        isSigningKeyManagementEnabled={isSigningKeyManagementEnabled}
        isDomainSelectionEnabled={isDomainSelectionEnabled}
        onUpdated={onUpdated}
        onSave={onSave}
      />
    );
  }

  if (isOidcProviderData(data)) {
    return (
      <OidcConnectorForm
        isDeleted={isDeleted}
        data={data}
        serviceProviderInfo={oidcServiceProviderInfo}
        onUpdated={onUpdated}
        onSave={onSave}
      />
    );
  }

  return null;
}

export default Connection;
