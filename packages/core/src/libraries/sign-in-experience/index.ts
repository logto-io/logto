import { builtInLanguages } from '@logto/phrases-ui';
import type { Branding, LanguageInfo, SignInExperience } from '@logto/schemas';
import { ConnectorType, BrandingStyle } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import i18next from 'i18next';

import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export * from './sign-up.js';
export * from './sign-in.js';

export const validateBranding = (branding: Branding) => {
  if (branding.style === BrandingStyle.Logo_Slogan) {
    assertThat(branding.slogan?.trim(), 'sign_in_experiences.empty_slogan');
  }

  assertThat(branding.logoUrl.trim(), 'sign_in_experiences.empty_logo');
};

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

  const getSignInExperience = async (): Promise<SignInExperience> => {
    const raw = await findDefaultSignInExperience();
    const { branding } = raw;

    // Alter sign-in experience dynamic configs
    return Object.freeze({
      ...raw,
      branding: { ...branding, slogan: branding.slogan && i18next.t(branding.slogan) },
    });
  };

  return {
    validateLanguageInfo,
    removeUnavailableSocialConnectorTargets,
    getSignInExperience,
  };
};
