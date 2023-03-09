import { builtInLanguages } from '@logto/phrases-ui';
import type { LanguageInfo, SignInExperience } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export * from './sign-up.js';
export * from './sign-in.js';

export type SignInExperienceLibrary = ReturnType<typeof createSignInExperienceLibrary>;

export const createSignInExperienceLibrary = (
  queries: Queries,
  connectorLibrary: ConnectorLibrary
) => {
  const {
    customPhrases: { findAllCustomLanguageTags },
    signInExperiences: { findDefaultSignInExperience, updateDefaultSignInExperience },
    users: { hasActiveUsers },
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
    const connectors = await connectorLibrary.getLogtoConnectors();
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

  const getSignInExperience = async (): Promise<SignInExperience> => findDefaultSignInExperience();

  return {
    validateLanguageInfo,
    removeUnavailableSocialConnectorTargets,
    getSignInExperience,
  };
};
