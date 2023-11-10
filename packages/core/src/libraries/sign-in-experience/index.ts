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

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { type FullSignInExperience } from './types.js';

export * from './sign-up.js';
export * from './sign-in.js';

export const developmentTenantPlanId = 'dev-tenant';

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

  const getActiveSsoConnectors = async (): Promise<SsoConnectorMetadata[]> => {
    // TODO: @simeng-li Remove the dev feature check once SSO is fully released
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return [];
    }

    const ssoConnectors = await getAvailableSsoConnectors();

    return ssoConnectors.map(
      ({ providerName, connectorName, id, branding, ssoOnly }): SsoConnectorMetadata => {
        const factory = ssoConnectorFactories[providerName];

        return {
          id,
          connectorName,
          ssoOnly,
          logo: branding.logo ?? factory.logo,
          darkLogo: branding.darkLogo,
        };
      }
    );
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

  const getFullSignInExperience = async (): Promise<FullSignInExperience> => {
    const [signInExperience, logtoConnectors, ssoConnectors, isDevelopmentTenant] =
      await Promise.all([
        findDefaultSignInExperience(),
        getLogtoConnectors(),
        getActiveSsoConnectors(),
        getIsDevelopmentTenant(),
      ]);

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
