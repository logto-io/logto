import { type SsoConnectorProvidersResponse, SsoProviderName } from '@logto/schemas';

const standardSsoConnectorProviders = Object.freeze([SsoProviderName.OIDC, SsoProviderName.SAML]);

export function categorizeSsoConnectorProviders(providers: SsoConnectorProvidersResponse = []): {
  standardProviders: SsoConnectorProvidersResponse;
  enterpriseProviders: SsoConnectorProvidersResponse;
} {
  const standardProviders = new Set<SsoConnectorProvidersResponse[number]>();
  const enterpriseProviders = new Set<SsoConnectorProvidersResponse[number]>();

  for (const provider of providers) {
    if (standardSsoConnectorProviders.includes(provider.providerName)) {
      standardProviders.add(provider);
    } else {
      enterpriseProviders.add(provider);
    }
  }

  return {
    standardProviders: [...standardProviders],
    enterpriseProviders: [...enterpriseProviders],
  };
}
