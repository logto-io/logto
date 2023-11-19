import { type SsoProviderName, type SsoConnectorWithProviderConfig } from '@logto/schemas';

// Help the Guide component type to be inferred from the connector's type.
export type SsoConnectorWithProviderConfigWithGeneric<T extends SsoProviderName> = Omit<
  SsoConnectorWithProviderConfig,
  'providerName'
> & {
  providerName: T;
};
