import { type I18nPhrases } from '@logto/connector-kit';
import { type SsoConnector } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';

import { type SingleSignOnFactory, ssoConnectorFactories } from '#src/sso/index.js';
import { type SsoProviderName } from '#src/sso/types/index.js';

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

export const fetchConnectorProviderDetails = async (connector: SsoConnector) => {
  const { providerName } = connector;

  if (!isSupportedSsoProvider(providerName)) {
    return connector;
  }

  const { logo, constructor } = ssoConnectorFactories[providerName];

  /* 
    Safely fetch and parse the detailed connector config from provider. 
    Return undefined if failed to fetch or parse the config.
  */
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
