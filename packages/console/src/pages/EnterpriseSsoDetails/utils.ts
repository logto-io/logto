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
 * On Cloud the subscription entitlement decides. Outside Cloud the tab follows the feature itself,
 * which Core only ships behind `isDevFeaturesEnabled` (its routes are not registered otherwise), so
 * there is neither a config form nor an upsell for a feature that is not available yet.
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

  if (isCloud) {
    return isIdpInitiatedSsoEnabled;
  }

  // IdP-initiated SSO is not ready for release; keep it hidden outside dev mode.
  return isDevFeaturesEnabled;
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
