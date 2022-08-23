import {
  Branding,
  BrandingStyle,
  SignInMethods,
  SignInMethodState,
  TermsOfUse,
} from '@logto/schemas';
import { Optional } from '@silverhand/essentials';

import { ConnectorType, LogtoConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

export const validateBranding = (branding: Branding) => {
  if (branding.style === BrandingStyle.Logo_Slogan) {
    assertThat(branding.slogan?.trim(), 'sign_in_experiences.empty_slogan');
  }

  assertThat(branding.logoUrl.trim(), 'sign_in_experiences.empty_logo');
};

export const validateTermsOfUse = (termsOfUse: TermsOfUse) => {
  assertThat(
    !termsOfUse.enabled || termsOfUse.contentUrl,
    'sign_in_experiences.empty_content_url_of_terms_of_use'
  );
};

export const isEnabled = (state: SignInMethodState) => state !== SignInMethodState.Disabled;

export const validateSignInMethods = (
  signInMethods: SignInMethods,
  socialSignInConnectorTargets: Optional<string[]>,
  enabledConnectors: LogtoConnector[]
) => {
  const signInMethodStates = Object.values(signInMethods);
  assertThat(
    signInMethodStates.filter((state) => state === SignInMethodState.Primary).length === 1,
    'sign_in_experiences.not_one_and_only_one_primary_sign_in_method'
  );

  if (isEnabled(signInMethods.email)) {
    assertThat(
      enabledConnectors.some((item) => item.metadata.type === ConnectorType.Email),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Email,
      })
    );
  }

  if (isEnabled(signInMethods.sms)) {
    assertThat(
      enabledConnectors.some((item) => item.metadata.type === ConnectorType.SMS),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.SMS,
      })
    );
  }

  if (isEnabled(signInMethods.social)) {
    assertThat(
      enabledConnectors.some((item) => item.metadata.type === ConnectorType.Social),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Social,
      })
    );

    assertThat(
      socialSignInConnectorTargets && socialSignInConnectorTargets.length > 0,
      'sign_in_experiences.empty_social_connectors'
    );
  }
};
