import { Branding, BrandingStyle, TermsOfUse } from '@logto/schemas';
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
