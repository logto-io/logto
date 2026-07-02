import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ConnectorsTabs } from '@/consts/page-tabs';
import { tenantSettingsPage } from '@/consts/pages';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useHostedEmailUsage from '@/pages/ConnectorDetails/EmailUsage/use-hosted-email-usage';

import styles from './index.module.scss';

/** Surface the banner once either window reaches this fraction of its cap. */
const bannerThreshold = 0.8;

const connectorsPasswordlessPage = `/connectors/${ConnectorsTabs.Passwordless}`;

/**
 * Global banner for the hosted email service cap, shown app-wide (below the topbar) once daily or
 * monthly usage crosses {@link bannerThreshold}. Two states — approaching (>=80%) and reached (at
 * the cap, a hard block that can interrupt sign-in emails) — each offering to connect an own email
 * provider or upgrade.
 *
 * Gated behind `isDevFeaturesEnabled` and to capped free/dev tenants (paid tenants report `null`
 * limits, so nothing renders). Dismissible per session; re-shown if the state escalates from
 * approaching to reached.
 */
function HostedEmailCapBanner() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isEnabled, data } = useHostedEmailUsage();
  const [dismissedSituation, setDismissedSituation] = useState<'approaching' | 'reached'>();

  if (!isEnabled || !data) {
    return null;
  }

  const { dailyUsage, dailyLimit, periodUsage, periodLimit } = data;
  // Guard against non-positive limits so a `0` cap can't yield NaN/Infinity ratios.
  const dailyRatio = dailyLimit !== null && dailyLimit > 0 ? dailyUsage / dailyLimit : 0;
  const monthlyRatio = periodLimit !== null && periodLimit > 0 ? periodUsage / periodLimit : 0;
  const ratio = Math.max(dailyRatio, monthlyRatio);

  if (ratio < bannerThreshold) {
    return null;
  }

  const situation = ratio >= 1 ? 'reached' : 'approaching';

  if (situation === dismissedSituation) {
    return null;
  }

  return (
    <div className={styles.container}>
      <InlineNotification
        severity={situation === 'reached' ? 'error' : 'alert'}
        action="general.got_it"
        onClick={() => {
          setDismissedSituation(situation);
        }}
      >
        <Trans
          components={{
            provider: <TextLink to={connectorsPasswordlessPage} />,
            upgrade: <TextLink to={tenantSettingsPage} />,
          }}
        >
          {t(`connector_details.logto_email.hosted_email_usage.banner.${situation}`)}
        </Trans>
      </InlineNotification>
    </div>
  );
}

export default HostedEmailCapBanner;
