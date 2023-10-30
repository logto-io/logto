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

import { type FullSignInExperience } from './types.js';

export * from './sign-up.js';
export * from './sign-in.js';

export type SignInExperienceLibrary = ReturnType<typeof createSignInExperienceLibrary>;

export const createSignInExperienceLibrary = (
  queries: Queries,
  { getLogtoConnectors }: ConnectorLibrary,
  { getSsoConnectors }: SsoConnectorLibrary
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
    // TODO: @simeng-li Return empty array if dev features are not enabled
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return [];
    }

    const ssoConnectors = await getSsoConnectors();

    return ssoConnectors.reduce<SsoConnectorMetadata[]>(
      (previous, connector): SsoConnectorMetadata[] => {
        const { providerName, connectorName, config, id, branding, domains } = connector;
        const factory = ssoConnectorFactories[providerName];

        // Filter out sso connectors that has invalid config
        const result = factory.configGuard.safeParse(config);

        if (!result.success) {
          return previous;
        }

        // Format the connector metadata for the client
        const connectorMetadata: SsoConnectorMetadata = {
          id,
          connectorName,
          domains,
          logo: branding.logo ?? factory.logo,
          darkLogo: branding.darkLogo,
        };

        return [...previous, connectorMetadata];
      },
      []
    );
  };

  const getFullSignInExperience = async (): Promise<FullSignInExperience> => {
    const [signInExperience, logtoConnectors, ssoConnectors] = await Promise.all([
      findDefaultSignInExperience(),
      getLogtoConnectors(),
      getActiveSsoConnectors(),
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
    };
  };

  return {
    validateLanguageInfo,
    removeUnavailableSocialConnectorTargets,
    getFullSignInExperience,
  };
};
