import { type I18nPhrases } from '@logto/connector-kit';
import { type JsonObject, type SsoConnector } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { type SingleSignOnFactory, ssoConnectorFactories } from '#src/sso/index.js';
import { type SsoProviderName } from '#src/sso/types/index.js';

import { type SsoConnectorWithProviderConfig } from './type.js';

const isKeyOfI18nPhrases = (key: string, phrases: I18nPhrases): key is keyof I18nPhrases =>
  key in phrases;

export const isSupportedSsoProvider = (providerName: string): providerName is SsoProviderName =>
  providerName in ssoConnectorFactories;

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
  const factory = ssoConnectorFactories[providerName];

  const result = allowPartial
    ? factory.configGuard.partial().safeParse(config)
    : factory.configGuard.safeParse(config);

  if (!result.success) {
    throw new RequestError({
      code: 'connector.invalid_config',
      status: 422,
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
  connector: SsoConnector
): Promise<SsoConnectorWithProviderConfig | undefined> => {
  const { providerName } = connector;

  // Return undefined if the provider is not supported
  if (!isSupportedSsoProvider(providerName)) {
    return undefined;
  }

  const { logo, constructor } = ssoConnectorFactories[providerName];

  const providerConfig = await trySafe(async () => {
    const instance = new constructor(connector);
    return instance.getConfig();
  });

  return {
    ...connector,
    providerLogo: logo,
    ...conditional(providerConfig && { providerConfig }),
  };
};
