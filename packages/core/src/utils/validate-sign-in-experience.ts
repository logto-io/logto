import {
  Branding,
  BrandingStyle,
  SignInMethods,
  SignInMethodState,
  TermsOfUse,
} from '@logto/schemas';
import { Optional } from '@silverhand/essentials';

import assertThat from '@/utils/assert-that';

export const validateBranding = (branding: Optional<Branding>) => {
  if (!branding) {
    return;
  }

  if (branding.style === BrandingStyle.Logo_Slogan) {
    assertThat(branding.slogan?.trim(), 'sign_in_experiences.empty_slogan');
  }
};

export const validateTermsOfUse = (termsOfUse: Optional<TermsOfUse>) => {
  assertThat(
    !termsOfUse?.enabled || termsOfUse.contentUrl,
    'sign_in_experiences.empty_content_url_of_terms_of_use'
  );
};

export const validateSignInMethods = (signInMethods?: SignInMethods) => {
  if (!signInMethods) {
    return;
  }

  const signInMethodStates = Object.values(signInMethods);
  assertThat(
    signInMethodStates.filter((state) => state === SignInMethodState.primary).length === 1,
    'sign_in_experiences.not_one_and_only_one_primary_sign_in_method'
  );

  // TODO: assert others next PR
};
