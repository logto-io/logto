import { GoogleConnector } from '@logto/connector-kit';
import { builtInLanguages } from '@logto/phrases-experience';
import type {
  ConnectorMetadata,
  FullSignInExperience,
  LanguageInfo,
  SignInExperience,
  SsoConnectorMetadata,
} from '@logto/schemas';
import { ConnectorType, ReservedPlanId } from '@logto/schemas';
import { deduplicate, pick, trySafe } from '@silverhand/essentials';
import deepmerge from 'deepmerge';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import type { SsoConnectorLibrary } from '#src/libraries/sso-connector.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { getTenantSubscription } from '#src/utils/subscription/index.js';
import { isKeyOfI18nPhrases } from '#src/utils/translation.js';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

export * from './sign-up.js';
export * from './sign-in.js';

export const developmentTenantPlanId = 'dev';

export type SignInExperienceLibrary = ReturnType<typeof createSignInExperienceLibrary>;

export const createSignInExperienceLibrary = (
  queries: Queries,
  { getLogtoConnectors }: ConnectorLibrary,
  { getAvailableSsoConnectors }: SsoConnectorLibrary,
  cloudConnection: CloudConnectionLibrary,
  wellKnownCache: WellKnownCache
) => {
  const {
    customPhrases: { findAllCustomLanguageTags },
    signInExperiences: { findDefaultSignInExperience, updateDefaultSignInExperience },
    applicationSignInExperiences: { safeFindSignInExperienceByApplicationId },
    captchaProviders: { findCaptchaProvider },
    organizations,
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
   *
   * **Caveats**: The result will be cached without updating mechanism since the tenant type is
   * not editable at the moment.
   */
  const getIsDevelopmentTenant = wellKnownCache.memoize(async (): Promise<boolean> => {
    const { isCloud, isIntegrationTest } = EnvSet.values;

    // Cloud only feature, return false in non-cloud environments
    if (!isCloud) {
      return false;
    }

    // Disable in integration tests
    if (isIntegrationTest) {
      return false;
    }

    const subscription = await getTenantSubscription(cloudConnection);
    return subscription.planId === ReservedPlanId.Development;
  }, ['is-development-tenant']);

  /**
   * Get the override data for the sign-in experience by reading from organization data. If the
   * entity is not found, return `undefined`.
   */
  const getOrganizationOverride = async (
    organizationId?: string
  ): Promise<Partial<SignInExperience> | undefined> => {
    if (!organizationId) {
      return;
    }
    const organization = await trySafe(organizations.findById(organizationId));
    if (!organization?.branding) {
      return;
    }

    return { branding: organization.branding };
  };

  const findApplicationSignInExperience = async (appId?: string) => {
    if (!appId) {
      return;
    }

    const found = await safeFindSignInExperienceByApplicationId(appId);

    if (!found) {
      return;
    }

    return pick(found, 'branding', 'color', 'type', 'isThirdParty');
  };

  /**
   * Query the captcha provider and return the public config for front-end usage.
   * Can not leak the secret key to the front-end.
   *
   * @returns The public config of the captcha provider.
   */
  const findCaptchaPublicConfig = async () => {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    const provider = await findCaptchaProvider();

    if (!provider) {
      return;
    }

    const { type, siteKey } = provider.config;

    return {
      type,
      siteKey,
    };
  };

  const getFullSignInExperience = async ({
    locale,
    organizationId,
    appId,
  }: {
    locale: string;
    organizationId?: string;
    appId?: string;
  }): Promise<FullSignInExperience> => {
    const [
      signInExperience,
      logtoConnectors,
      isDevelopmentTenant,
      organizationOverride,
      appSignInExperience,
      captchaConfig,
    ] = await Promise.all([
      findDefaultSignInExperience(),
      getLogtoConnectors(),
      getIsDevelopmentTenant(),
      getOrganizationOverride(organizationId),
      findApplicationSignInExperience(appId),
      findCaptchaPublicConfig(),
    ]);

    // Always return empty array if single-sign-on is disabled
    const ssoConnectors = signInExperience.singleSignOnEnabled
      ? await getActiveSsoConnectors(locale)
      : [];

    const forgotPassword = {
      phone: logtoConnectors.some(({ type }) => type === ConnectorType.Sms),
      email: logtoConnectors.some(({ type }) => type === ConnectorType.Email),
    };

    const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
      ConnectorMetadata[]
    >((previous, connectorTarget) => {
      const connectors = logtoConnectors.filter(
        ({ metadata: { target } }) => target === connectorTarget
      );

      return [
        ...previous,
        ...connectors.map(({ metadata, dbEntry: { id } }) => ({ ...metadata, id })),
      ];
    }, []);

    /**
     * Get the Google One Tap configuration if the Google connector is enabled and configured.
     */
    const getGoogleOneTap = (): FullSignInExperience['googleOneTap'] => {
      const googleConnector =
        signInExperience.socialSignInConnectorTargets.includes(GoogleConnector.target) &&
        logtoConnectors.find(({ metadata }) => metadata.id === GoogleConnector.factoryId);

      if (!googleConnector) {
        return;
      }

      const googleConnectorConfig = GoogleConnector.configGuard.safeParse(
        googleConnector.dbEntry.config
      );

      if (!googleConnectorConfig.success) {
        return;
      }

      return {
        ...googleConnectorConfig.data.oneTap,
        clientId: googleConnectorConfig.data.clientId,
        connectorId: googleConnector.dbEntry.id,
      };
    };

    /** Get the branding and color from the app sign-in experience if it is not a third-party app. */
    const getAppSignInExperience = () => {
      if (!appSignInExperience || appSignInExperience.isThirdParty) {
        return {};
      }
      return pick(appSignInExperience, 'branding', 'color');
    };

    return {
      ...deepmerge(
        deepmerge(signInExperience, getAppSignInExperience()),
        organizationOverride ?? {}
      ),
      socialConnectors,
      ssoConnectors,
      forgotPassword,
      isDevelopmentTenant,
      googleOneTap: getGoogleOneTap(),
      captchaConfig,
    };
  };

  return {
    validateLanguageInfo,
    removeUnavailableSocialConnectorTargets,
    getFullSignInExperience,
    findCaptchaPublicConfig,
  };
};
