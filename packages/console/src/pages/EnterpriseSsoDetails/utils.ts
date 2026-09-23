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
  /** Whether the license installed on this self-hosted deployment grants `idpInitiatedSso`. */
  readonly isIdpInitiatedSsoLicensed: boolean;
};

/**
 * Whether the IdP-initiated SSO tab shows the self-hosted upsell instead of the config form.
 *
 * On Cloud the tab only appears when the subscription entitles it, so there is never an upsell. On
 * a self-hosted deployment the installed license decides; without one, the upsell is shown.
 */
export const shouldShowIdpInitiatedAuthUpsell = ({
  isCloud,
  isIdpInitiatedSsoLicensed,
}: ShouldShowIdpInitiatedAuthUpsellOptions) => !isCloud && !isIdpInitiatedSsoLicensed;
