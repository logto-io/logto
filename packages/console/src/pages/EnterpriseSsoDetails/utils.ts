import { SsoProviderType } from '@logto/schemas';

type ShouldShowIdpInitiatedAuthTabOptions = {
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
  readonly providerType?: SsoProviderType;
  readonly isIdpInitiatedSsoEnabled: boolean;
};

/**
 * Whether the connector details page shows the IdP-initiated SSO tab.
 *
 * On both Cloud and self-hosted deployments, the feature is dev-only because Core does not register
 * its routes otherwise. On Cloud the subscription must also grant the entitlement.
 */
export const shouldShowIdpInitiatedAuthTab = ({
  isCloud,
  isDevFeaturesEnabled,
  providerType,
  isIdpInitiatedSsoEnabled,
}: ShouldShowIdpInitiatedAuthTabOptions) => {
  if (providerType !== SsoProviderType.SAML) {
    return false;
  }

  // IdP-initiated SSO is not ready for release; keep it hidden outside dev mode.
  if (!isDevFeaturesEnabled) {
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
