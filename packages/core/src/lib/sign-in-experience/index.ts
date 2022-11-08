import { builtInLanguages } from '@logto/phrases-ui';
import type { Branding, LanguageInfo, TermsOfUse } from '@logto/schemas';
import { ConnectorType, BrandingStyle } from '@logto/schemas';

import { getLogtoConnectors } from '@/connectors';
import RequestError from '@/errors/RequestError';
import { findAllCustomLanguageTags } from '@/queries/custom-phrase';
import {
  findDefaultSignInExperience,
  updateDefaultSignInExperience,
} from '@/queries/sign-in-experience';
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
