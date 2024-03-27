import { type I18nPhrases } from '@logto/connector-kit';
import type {
  JsonObject,
  SsoConnectorWithProviderConfig,
  SupportedSsoConnector,
  SsoProviderName,
} from '@logto/schemas';
import { findDuplicatedOrBlockedEmailDomains } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import SamlConnector from '#src/sso/SamlConnector/index.js';
import { type SingleSignOnFactory, ssoConnectorFactories } from '#src/sso/index.js';
import { type SingleSignOnConnectorData } from '#src/sso/types/connector.js';

const isKeyOfI18nPhrases = (key: string, phrases: I18nPhrases): key is keyof I18nPhrases =>
  key in phrases;

export const parseFactoryDetail = (
  factory: SingleSignOnFactory<SsoProviderName>,
  locale: string
) => {
  const { providerName, logo, logoDark, description, name, providerType } = factory;

  return {
    providerName,
    providerType,
    logo,
    logoDark,
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- falsy value expected
    description: (isKeyOfI18nPhrases(locale, description) && description[locale]) || description.en,
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- falsy value expected
    name: (isKeyOfI18nPhrases(locale, name) && name[locale]) || name.en,
  };
};

/* 
  Validate the connector config if it's provided.
  Throw error if the config is invalid.
  Partially validate the config if allowPartial is true.
*/
export const parseConnectorConfig = (providerName: SsoProviderName, config: JsonObject) => {
  const factory = ssoConnectorFactories[providerName];

  const result = factory.configGuard.safeParse(config);

  if (!result.success) {
    throw new RequestError({
      code: 'connector.invalid_config',
      status: 400,
      details: result.error.flatten(),
    });
  }

  return result.data;
};

export const fetchConnectorProviderDetails = async (
  connector: SupportedSsoConnector,
  tenantId: string,
  locale: string
): Promise<SsoConnectorWithProviderConfig> => {
  const { providerName } = connector;

  const { logo, logoDark, constructor, name, providerType } = ssoConnectorFactories[providerName];

  /* 
    Safely fetch and parse the detailed connector config from provider. 
    Return undefined if failed to fetch or parse the config.
  */
  const providerConfig = await trySafe(async () => {
    const instance = new constructor(connector, tenantId);
    return instance.getConfig();
  });

  return {
    ...connector,
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- falsy value expected
    name: (isKeyOfI18nPhrases(locale, name) && name[locale]) || name.en,
    providerType,
    providerLogo: logo,
    providerLogoDark: logoDark,
    providerConfig,
  };
};

/**
 * Validate the connector config.
 * Fetch or parse the connector IdP detailed settings using the connector config.
 * Throw error if the connector config is invalid.
 */
export const validateConnectorConfigConnectionStatus = async (
  connector: SingleSignOnConnectorData,
  tenantId: string
) => {
  const { providerName } = connector;
  const { constructor } = ssoConnectorFactories[providerName];
  const instance = new constructor(connector, tenantId);

  // SAML connector's idpMetadata is optional (safely catch by the getConfig method), we need to force fetch the IdP metadata here
  if (instance instanceof SamlConnector) {
    return instance.getSamlIdpMetadata();
  }

  return instance.getConfig();
};

/**
 * Validate the connector domains using the domain blacklist.
 * - Throw error if the domains are invalid.
 * - Throw error if the domains are duplicated.
 *
 * @param domains
 * @returns
 */
export const validateConnectorDomains = (domains: string[]) => {
  const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains(domains);

  if (forbiddenDomains.size > 0) {
    throw new RequestError(
      {
        code: 'single_sign_on.forbidden_domains',
        status: 422,
      },
      {
        data: [...forbiddenDomains],
      }
    );
  }

  if (duplicatedDomains.size > 0) {
    throw new RequestError(
      {
        code: 'single_sign_on.duplicated_domains',
        status: 422,
      },
      {
        data: [...duplicatedDomains],
      }
    );
  }
};
