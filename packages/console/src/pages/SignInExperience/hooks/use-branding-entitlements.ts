import { useContext } from 'react';

import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

/**
 * Whether hiding the Logto branding and configuring the Custom UI CSP are available.
 *
 * On Cloud, both fields are always part of the form, and the tenant subscription decides whether
 * they are enabled through the shared `bringYourUiEnabled` quota. On a self-hosted deployment, each
 * one comes with its own entitlement in the installed license: hiding the branding with
 * `hideLogtoBranding`, and the Custom UI CSP with `bringYourUi`, which it is part of. Without a
 * license, neither is available, as in plain OSS.
 */
const useBrandingEntitlements = () => {
  const { currentSubscriptionQuota, license } = useContext(SubscriptionDataContext);

  if (isCloud) {
    const { bringYourUiEnabled } = currentSubscriptionQuota;

    return {
      /** Whether the hide branding field is part of the form and its payload. */
      isHideLogtoBrandingAvailable: true,
      /** Whether the hide branding switch can be turned on. */
      isHideLogtoBrandingEnabled: bringYourUiEnabled,
      /** Whether the Custom UI CSP form can be edited and is part of the payload. */
      isCustomUiCspEnabled: bringYourUiEnabled,
    };
  }

  const isHideLogtoBrandingEnabled = license?.quota.hideLogtoBranding ?? false;

  return {
    isHideLogtoBrandingAvailable: isHideLogtoBrandingEnabled,
    isHideLogtoBrandingEnabled,
    isCustomUiCspEnabled: license?.quota.bringYourUi ?? false,
  };
};

export default useBrandingEntitlements;
