import { builtInLanguages } from '@logto/phrases-ui';
import type { Branding, LanguageInfo, SignInExperience } from '@logto/schemas';
import {
  SignInMode,
  ConnectorType,
  BrandingStyle,
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
  demoAppApplicationId,
} from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import i18next from 'i18next';

import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { defaultConnectorLibrary } from '#src/libraries/connector.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { defaultQueries } from '../shared.js';

export * from './sign-up.js';
export * from './sign-in.js';

export const validateBranding = (branding: Branding) => {
  if (branding.style === BrandingStyle.Logo_Slogan) {
    assertThat(branding.slogan?.trim(), 'sign_in_experiences.empty_slogan');
  }

  assertThat(branding.logoUrl.trim(), 'sign_in_experiences.empty_logo');
};

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

  const getSignInExperienceForApplication = async (
    applicationId?: string
  ): Promise<SignInExperience & { notification?: string }> => {
    const signInExperience = await findDefaultSignInExperience();

    // Hard code AdminConsole sign-in methods settings.
    if (applicationId === adminConsoleApplicationId) {
      return {
        ...adminConsoleSignInExperience,
        branding: {
          ...adminConsoleSignInExperience.branding,
          slogan: i18next.t('admin_console.welcome.title'),
        },
        termsOfUseUrl: signInExperience.termsOfUseUrl,
        languageInfo: signInExperience.languageInfo,
        signInMode: (await hasActiveUsers()) ? SignInMode.SignIn : SignInMode.Register,
        socialSignInConnectorTargets: [],
      };
    }

    // Insert Demo App Notification
    if (applicationId === demoAppApplicationId) {
      const { socialSignInConnectorTargets } = signInExperience;

      const notification = i18next.t('demo_app.notification');

      return {
        ...signInExperience,
        socialSignInConnectorTargets,
        notification,
      };
    }

    return signInExperience;
  };

  return {
    validateLanguageInfo,
    removeUnavailableSocialConnectorTargets,
    getSignInExperienceForApplication,
  };
};

/** @deprecated Don't use. This is for transition only and will be removed soon. */
export const {
  validateLanguageInfo,
  removeUnavailableSocialConnectorTargets,
  getSignInExperienceForApplication,
} = createSignInExperienceLibrary(defaultQueries, defaultConnectorLibrary);
