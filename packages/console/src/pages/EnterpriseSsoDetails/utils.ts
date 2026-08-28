import { SsoProviderType } from '@logto/schemas';

type ShouldShowIdpInitiatedAuthTabOptions = {
  readonly isCloud: boolean;
  readonly providerType?: SsoProviderType;
  readonly isIdpInitiatedSsoEnabled: boolean;
};

export const shouldShowIdpInitiatedAuthTab = ({
  isCloud,
  providerType,
  isIdpInitiatedSsoEnabled,
}: ShouldShowIdpInitiatedAuthTabOptions) => {
  if (providerType !== SsoProviderType.SAML) {
    return false;
  }

  if (isCloud) {
    return isIdpInitiatedSsoEnabled;
  }

  return true;
};

type ShouldShowIdpInitiatedAuthUpsellOptions = {
  readonly isCloud: boolean;
  readonly isIdpInitiatedSsoEnabled: boolean;
};

export const shouldShowIdpInitiatedAuthUpsell = ({
  isCloud,
  isIdpInitiatedSsoEnabled,
}: ShouldShowIdpInitiatedAuthUpsellOptions) => !isCloud && !isIdpInitiatedSsoEnabled;
