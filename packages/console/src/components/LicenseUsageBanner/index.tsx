import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storageKeys } from '@/consts';
import { isCloud } from '@/consts/env';
import { buildOfficialWebsiteContactPageUrl } from '@/consts/external-links';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import { formatNumberWithComma } from '@/utils/number';

import styles from './index.module.scss';
import {
  licenseUsageBannerDismissDuration,
  parseLicenseUsageBannerDismissedUntil,
  shouldShowLicenseUsageBanner,
  usageMetricPhraseKeys,
} from './license-usage-banner';

const contactUrl = buildOfficialWebsiteContactPageUrl('self-hosted-license-usage');

/**
 * Warn that this deployment is above the usage limits of its license, which the self-hosted terms
 * ask the customer to settle within 30 days by upgrading or reducing usage.
 *
 * The warnings carry the metric, the limit and the value, so the banner names what is over instead
 * of only saying that something is. Usage is evaluated locally too, so the banner works offline and
 * with usage reporting disabled; with no warning there is no usage UI at all.
 */
function LicenseUsageBanner() {
  const { license } = useContext(SubscriptionDataContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [dismissedUntil, setDismissedUntil] = useState(() =>
    parseLicenseUsageBannerDismissedUntil(
      localStorage.getItem(storageKeys.licenseUsageBannerDismissedUntil)
    )
  );
  const warnings = license?.usageWarnings ?? [];

  if (
    !shouldShowLicenseUsageBanner({
      isCloud,
      hasUsageWarnings: warnings.length > 0,
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
        <div>{t('tenants.license.usage_banner_description')}</div>
        <ul className={styles.metrics}>
          {warnings.map(({ metric, value, limit }) => {
            const metricPhraseKey = usageMetricPhraseKeys[metric];

            return (
              <li key={metric}>
                {t('tenants.license.usage_banner_metric', {
                  metric: metricPhraseKey ? t(metricPhraseKey) : metric,
                  value: formatNumberWithComma(value),
                  limit: formatNumberWithComma(limit),
                })}
              </li>
            );
          })}
        </ul>
        <div>{t('tenants.license.usage_banner_action')}</div>
      </InlineNotification>
    </div>
  );
}

export default LicenseUsageBanner;
