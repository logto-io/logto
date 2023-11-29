import { builtInLanguages } from '@logto/phrases-experience';
import type { ConnectorMetadata, LanguageInfo, SsoConnectorMetadata } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import type { SsoConnectorLibrary } from '#src/libraries/sso-connector.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { getTenantSubscriptionPlan } from '#src/utils/subscription/index.js';
import { isKeyOfI18nPhrases } from '#src/utils/translation.js';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { type FullSignInExperience } from './types.js';

export * from './sign-up.js';
export * from './sign-in.js';

export const developmentTenantPlanId = 'dev';

export type SignInExperienceLibrary = ReturnType<typeof createSignInExperienceLibrary>;

export const createSignInExperienceLibrary = (
  queries: Queries,
  { getLogtoConnectors }: ConnectorLibrary,
  { getAvailableSsoConnectors }: SsoConnectorLibrary,
  cloudConnection: CloudConnectionLibrary
) => {
  const {
    customPhrases: { findAllCustomLanguageTags },
    signInExperiences: { findDefaultSignInExperience, updateDefaultSignInExperience },
  } = queries;

  const validateLanguageInfo = async (languageInfo: LanguageInfo) => {
    const supportedLanguages = [...builtInLanguages, ...(await findAllCustomLanguageTags())];

    assertThat(
      supportedLanguages.includes(languageInfo.fallbackLanguage),
      new RequestError({
        code: 'sign_in_experiences.unsupported_default_language',
        language: languageInfo.fallbackLanguage,
      })
    );
  };

  const removeUnavailableSocialConnectorTargets = async () => {
    const connectors = await getLogtoConnectors();
    const availableSocialConnectorTargets = deduplicate(
      connectors
        .filter(({ type }) => type === ConnectorType.Social)
        .map(({ metadata: { target } }) => target)
    );

    const { socialSignInConnectorTargets } = await findDefaultSignInExperience();

    await updateDefaultSignInExperience({
      socialSignInConnectorTargets: socialSignInConnectorTargets.filter((target) =>
        availableSocialConnectorTargets.includes(target)
      ),
    });
  };

  const getActiveSsoConnectors = async (locale: string): Promise<SsoConnectorMetadata[]> => {
    // TODO: @simeng-li Remove the dev feature check once SSO is fully released
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return [];
    }

    const ssoConnectors = await getAvailableSsoConnectors();

    return ssoConnectors.map(({ providerName, id, branding }): SsoConnectorMetadata => {
      const factory = ssoConnectorFactories[providerName];
      const { name, logo, logoDark } = factory;

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string is not a valid locale
      const providerNameInLocale = (isKeyOfI18nPhrases(locale, name) && name[locale]) || name.en;

      return {
        id,
        // Use the provider name as the connector name if the branding displayName is not provided
        connectorName: branding.displayName ?? providerNameInLocale,
        logo: branding.logo ?? logo,
        darkLogo: branding.darkLogo ?? logoDark,
      };
    });
  };

  /**
   * Query the tenant subscription plan to determine if the tenant is a development tenant.
   */
  const getIsDevelopmentTenant = async (): Promise<boolean> => {
    const { isCloud, isIntegrationTest } = EnvSet.values;

    // Cloud only feature, return false in non-cloud environments
    if (!isCloud) {
      return false;
    }

    // Disable in integration tests
    if (isIntegrationTest) {
      return false;
    }

    const plan = await getTenantSubscriptionPlan(cloudConnection);

    return plan.id === developmentTenantPlanId;
  };

  const getFullSignInExperience = async (locale: string): Promise<FullSignInExperience> => {
    const [signInExperience, logtoConnectors, isDevelopmentTenant] = await Promise.all([
      findDefaultSignInExperience(),
      getLogtoConnectors(),
      getIsDevelopmentTenant(),
    ]);

    const ssoConnectors = signInExperience.singleSignOnEnabled
      ? await getActiveSsoConnectors(locale)
      : [];

    const forgotPassword = {
      phone: logtoConnectors.some(({ type }) => type === ConnectorType.Sms),
      email: logtoConnectors.some(({ type }) => type === ConnectorType.Email),
    };

    const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
      Array<ConnectorMetadata & { id: string }>
    >((previous, connectorTarget) => {
      const connectors = logtoConnectors.filter(
        ({ metadata: { target } }) => target === connectorTarget
      );

      return [
        ...previous,
        ...connectors.map(({ metadata, dbEntry: { id } }) => ({ ...metadata, id })),
      ];
    }, []);

    return {
      ...signInExperience,
      socialConnectors,
      ssoConnectors,
      forgotPassword,
      isDevelopmentTenant,
    };
  };

  return {
    validateLanguageInfo,
    removeUnavailableSocialConnectorTargets,
    getFullSignInExperience,
  };
};
