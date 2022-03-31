import {
  Branding,
  BrandingStyle,
  SignInMethods,
  SignInMethodState,
  TermsOfUse,
} from '@logto/schemas';

import { getConnectorInstances } from '@/connectors';
import { ConnectorInstance, ConnectorType } from '@/connectors/types';
import assertThat from '@/utils/assert-that';

export const assertBranding = (branding?: Branding) => {
  if (!branding) {
    return;
  }

  if (branding.style === BrandingStyle.Logo_Slogan) {
    assertThat(
      branding.slogan && branding.slogan.trim() === '',
      'sign_in_experiences.empty_slogan'
    );
  }
};

export const assertTermsOfUse = (termsOfUse?: TermsOfUse) => {
  if (!termsOfUse) {
    return;
  }

  if (termsOfUse.enabled) {
    assertThat(termsOfUse.contentUrl, 'sign_in_experiences.empty_content_url_of_terms_of_use');
  }
};

const assertOneAndOnlyOnePrimarySignInMethod = (signInMethods: SignInMethods) => {
  const signInMethodStates = Object.values(signInMethods);
  const primarySignInMethodCount = signInMethodStates.reduce(
    (primaryCount, signInMethodState) =>
      primaryCount + (signInMethodState === SignInMethodState.primary ? 1 : 0),
    0
  );
  assertThat(
    primarySignInMethodCount === 1,
    'sign_in_experiences.not_one_and_only_one_primary_sign_in_method'
  );
};

export const isEnabled = (state: SignInMethodState) => state !== SignInMethodState.disabled;

const assertEnabledConnectorByType = (
  type: ConnectorType,
  enabledConnectorInstances: ConnectorInstance[]
) => {
  assertThat(
    enabledConnectorInstances.some((item) => item.metadata.type === type),
    'sign_in_experiences.enabled_connector_not_found',
    { type }
  );
};

const assertNonemptySocialConnectorIds: (value?: string[]) => asserts value is string[] = (
  socialSignInConnectorIds
) => {
  assertThat(
    socialSignInConnectorIds && socialSignInConnectorIds.length > 0,
    'sign_in_experiences.empty_social_connectors'
  );
};

const assertEnabledSocialConnectorIds = (
  socialSignInConnectorIds: string[],
  enabledConnectorInstances: ConnectorInstance[]
) => {
  const enabledSocialConnectorIds = new Set(
    enabledConnectorInstances
      .filter((instance) => instance.metadata.type === ConnectorType.Social)
      .map((instance) => instance.connector.id)
  );
  assertThat(
    socialSignInConnectorIds.every((id) => enabledSocialConnectorIds.has(id)),
    'sign_in_experiences.invalid_social_connectors'
  );
};

export const assertSignInMethods = async (
  signInMethods?: SignInMethods,
  socialSignInConnectorIds?: string[]
) => {
  if (!signInMethods) {
    return;
  }

  assertOneAndOnlyOnePrimarySignInMethod(signInMethods);

  const connectorInstances = await getConnectorInstances();
  const enabledConnectorInstances = connectorInstances.filter(
    (instance) => instance.connector.enabled
  );

  if (isEnabled(signInMethods.email)) {
    assertEnabledConnectorByType(ConnectorType.Email, enabledConnectorInstances);
  }

  if (isEnabled(signInMethods.sms)) {
    assertEnabledConnectorByType(ConnectorType.SMS, enabledConnectorInstances);
  }

  if (isEnabled(signInMethods.social)) {
    assertEnabledConnectorByType(ConnectorType.Social, enabledConnectorInstances);
    assertNonemptySocialConnectorIds(socialSignInConnectorIds);
    assertEnabledSocialConnectorIds(socialSignInConnectorIds, enabledConnectorInstances);
  }
};
