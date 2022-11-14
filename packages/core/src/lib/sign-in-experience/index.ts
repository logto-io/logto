import { builtInLanguages } from '@logto/phrases-ui';
import type { Branding, LanguageInfo, SignInExperience, TermsOfUse } from '@logto/schemas';
import { SignInMode, ConnectorType, BrandingStyle } from '@logto/schemas';
import {
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
  demoAppApplicationId,
} from '@logto/schemas/lib/seeds';
import i18next from 'i18next';

import { getLogtoConnectors } from '@/connectors';
import RequestError from '@/errors/RequestError';
import { findAllCustomLanguageTags } from '@/queries/custom-phrase';
import {
  findDefaultSignInExperience,
  updateDefaultSignInExperience,
} from '@/queries/sign-in-experience';
import { hasActiveUsers } from '@/queries/user';
import assertThat from '@/utils/assert-that';

export * from './sign-up';
export * from './sign-in';

export const validateBranding = (branding: Branding) => {
  if (branding.style === BrandingStyle.Logo_Slogan) {
    assertThat(branding.slogan?.trim(), 'sign_in_experiences.empty_slogan');
  }

  assertThat(branding.logoUrl.trim(), 'sign_in_experiences.empty_logo');
};

export const validateLanguageInfo = async (languageInfo: LanguageInfo) => {
  const supportedLanguages = [...builtInLanguages, ...(await findAllCustomLanguageTags())];

  assertThat(
    supportedLanguages.includes(languageInfo.fallbackLanguage),
    new RequestError({
      code: 'sign_in_experiences.unsupported_default_language',
      language: languageInfo.fallbackLanguage,
    })
  );
};

export const validateTermsOfUse = (termsOfUse: TermsOfUse) => {
  assertThat(
    !termsOfUse.enabled || termsOfUse.contentUrl,
    'sign_in_experiences.empty_content_url_of_terms_of_use'
  );
};

export const removeUnavailableSocialConnectorTargets = async () => {
  const connectors = await getLogtoConnectors();
  const availableSocialConnectorTargets = new Set(
    connectors
      .filter(({ type, dbEntry: { enabled } }) => enabled && type === ConnectorType.Social)
      .map(({ metadata: { target } }) => target)
  );

  const { socialSignInConnectorTargets } = await findDefaultSignInExperience();
  await updateDefaultSignInExperience({
    socialSignInConnectorTargets: socialSignInConnectorTargets.filter((target) =>
      availableSocialConnectorTargets.has(target)
    ),
  });
};

export const getSignInExperienceForApplication = async (
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
      languageInfo: signInExperience.languageInfo,
      signInMode: (await hasActiveUsers()) ? SignInMode.SignIn : SignInMode.Register,
      socialSignInConnectorTargets: [],
    };
  }

  // Insert Demo App Notification
  if (applicationId === demoAppApplicationId) {
    const {
      socialSignInConnectorTargets,
      languageInfo: { autoDetect, fallbackLanguage },
    } = signInExperience;

    const notification = i18next.t(
      'demo_app.notification',
      autoDetect ? undefined : { lng: fallbackLanguage }
    );

    return {
      ...signInExperience,
      socialSignInConnectorTargets,
      notification,
    };
  }

  return signInExperience;
};
