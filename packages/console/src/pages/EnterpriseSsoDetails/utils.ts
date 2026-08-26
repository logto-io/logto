import { SsoProviderType } from '@logto/schemas';

type ShouldShowIdpInitiatedAuthTabOptions = {
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
  readonly providerType?: SsoProviderType;
  readonly isIdpInitiatedSsoEnabled: boolean;
};

export const shouldShowIdpInitiatedAuthTab = ({
  isCloud,
  isDevFeaturesEnabled,
  providerType,
  isIdpInitiatedSsoEnabled,
}: ShouldShowIdpInitiatedAuthTabOptions) => {
  if (providerType !== SsoProviderType.SAML) {
    return false;
  }

  if (isCloud) {
    return isDevFeaturesEnabled && isIdpInitiatedSsoEnabled;
  }

  // DEV: self-hosted plans
  return isDevFeaturesEnabled;
};

type ShouldShowIdpInitiatedAuthUpsellOptions = {
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
  readonly isIdpInitiatedSsoEnabled: boolean;
};

export const shouldShowIdpInitiatedAuthUpsell = ({
  isCloud,
  isDevFeaturesEnabled,
  isIdpInitiatedSsoEnabled,
}: ShouldShowIdpInitiatedAuthUpsellOptions) => {
  // DEV: self-hosted plans
  return !isCloud && isDevFeaturesEnabled && !isIdpInitiatedSsoEnabled;
};
