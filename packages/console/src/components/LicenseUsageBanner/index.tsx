import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TenantSettingsTabs, storageKeys } from '@/consts';
import { isCloud } from '@/consts/env';
import { buildOfficialWebsiteContactPageUrl } from '@/consts/external-links';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';
import {
  licenseUsageBannerDismissDuration,
  parseLicenseUsageBannerDismissedUntil,
  shouldShowLicenseUsageBanner,
} from './license-usage-banner';

const licensePage = `/tenant-settings/${TenantSettingsTabs.License}`;
const contactUrl = buildOfficialWebsiteContactPageUrl('self-hosted-license-usage');

/**
 * Warn that this deployment is above the usage limits of its license, which the self-hosted terms
 * ask the customer to settle within 30 days by upgrading or reducing usage.
 *
 * The warnings carry the metrics Logto evaluates locally or counts in Cloud, such as too many
 * production deployments, so one banner covers every metric without listing them. Usage is
 * evaluated locally too, so the banner works offline and with usage reporting disabled.
 */
function LicenseUsageBanner() {
  const { license } = useContext(SubscriptionDataContext);
  const { match } = useTenantPathname();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [dismissedUntil, setDismissedUntil] = useState(() =>
    parseLicenseUsageBannerDismissedUntil(
      localStorage.getItem(storageKeys.licenseUsageBannerDismissedUntil)
    )
  );

  if (
    !shouldShowLicenseUsageBanner({
      isCloud,
      isLicensePage: match(licensePage),
      hasUsageWarnings: Boolean(license?.usageWarnings?.length),
      dismissedUntil,
      now: Date.now(),
    })
  ) {
    return null;
  }

  const onDismiss = () => {
    const nextDismissedUntil = Date.now() + licenseUsageBannerDismissDuration;

    localStorage.setItem(storageKeys.licenseUsageBannerDismissedUntil, String(nextDismissedUntil));
    setDismissedUntil(nextDismissedUntil);
  };

  return (
    <div className={styles.container}>
      <InlineNotification
        severity="alert"
        action="general.contact_us_action"
        href={contactUrl}
        hrefTargetBlank="noopener"
        onDismiss={onDismiss}
      >
        {t('tenants.license.usage_banner_description')}
      </InlineNotification>
    </div>
  );
}

export default LicenseUsageBanner;
