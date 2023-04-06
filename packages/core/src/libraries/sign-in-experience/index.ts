import { builtInLanguages } from '@logto/phrases-ui';
import type { ConnectorMetadata, LanguageInfo } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type FullSignInExperience } from './types.js';

export * from './sign-up.js';
export * from './sign-in.js';

export type SignInExperienceLibrary = ReturnType<typeof createSignInExperienceLibrary>;

export const createSignInExperienceLibrary = (
  queries: Queries,
  { getLogtoConnectors }: ConnectorLibrary
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

  const getSignInExperience = findDefaultSignInExperience;

  const getFullSignInExperience = async (): Promise<FullSignInExperience> => {
    const [signInExperience, logtoConnectors] = await Promise.all([
      getSignInExperience(),
      getLogtoConnectors(),
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
      forgotPassword,
    };
  };

  return {
    validateLanguageInfo,
    removeUnavailableSocialConnectorTargets,
    getSignInExperience,
    getFullSignInExperience,
  };
};
