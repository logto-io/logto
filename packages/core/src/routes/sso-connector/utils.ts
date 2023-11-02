import { type I18nPhrases } from '@logto/connector-kit';
import { type JsonObject } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';

import { mockBaseSamlConfig, mockBaseOidcConfig } from '#src/__mocks__/sso.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type SingleSignOnFactory, ssoConnectorFactories } from '#src/sso/index.js';
import { type SupportedSsoConnector } from '#src/sso/types/index.js';
import { SsoProviderName } from '#src/sso/types/index.js';
import { basicSamlConnectorConfigPartialGuard } from '#src/sso/types/saml.js';

import { type SsoConnectorWithProviderConfig } from './type.js';

const {
  EnvSet: {
    values: { isIntegrationTest },
  },
} = await import('#src/env-set/index.js');

const isKeyOfI18nPhrases = (key: string, phrases: I18nPhrases): key is keyof I18nPhrases =>
  key in phrases;

const getPartialConfigGuard = (providerName: SsoProviderName, allowPartial?: boolean) => {
  if (!allowPartial) {
    return ssoConnectorFactories[providerName].configGuard;
  }

  if (providerName === SsoProviderName.SAML) {
    return basicSamlConnectorConfigPartialGuard;
  }

  return ssoConnectorFactories[providerName].configGuard.partial();
};

export const parseFactoryDetail = (
  factory: SingleSignOnFactory<SsoProviderName>,
  locale: string
) => {
  const { providerName, logo, description } = factory;

  return {
    providerName,
    logo,
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- falsy value expected
    description: (isKeyOfI18nPhrases(locale, description) && description[locale]) || description.en,
  };
};

/* 
  Validate the connector config if it's provided.
  Throw error if the config is invalid.
  Partially validate the config if allowPartial is true.
*/
export const parseConnectorConfig = (
  providerName: SsoProviderName,
  config: JsonObject,
  allowPartial?: boolean
) => {
  const configGuard = getPartialConfigGuard(providerName, allowPartial);
  const result = configGuard.safeParse(config);

  if (!result.success) {
    throw new RequestError({
      code: 'connector.invalid_config',
      status: 400,
      details: result.error.flatten(),
    });
  }

  return result.data;
};

/* 
  Safely fetch and parse the detailed connector config from provider. 
  Return undefined if failed to fetch or parse the config.
*/
export const fetchConnectorProviderDetails = async (
  connector: SupportedSsoConnector,
  tenantId: string
): Promise<SsoConnectorWithProviderConfig> => {
  const { providerName } = connector;

  const { logo, constructor } = ssoConnectorFactories[providerName];

  const providerConfig = await trySafe(async () => {
    const instance = new constructor(connector, tenantId);
    // To avoid `getConfig()` being called in integration tests and throwing time out error.
    if (isIntegrationTest) {
      return providerName === SsoProviderName.OIDC ? mockBaseOidcConfig : mockBaseSamlConfig;
    }
    return instance.getConfig();
  });

  return {
    ...connector,
    providerLogo: logo,
    ...conditional(providerConfig && { providerConfig }),
  };
};
