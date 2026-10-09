import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { TenantSettingsTabs } from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import {
  getLicenseRefusalReasonPhraseKey,
  getLicenseStatus,
} from '@/pages/OssTenantSettings/License/utils';

import styles from './index.module.scss';

const licensePage = `/tenant-settings/${TenantSettingsTabs.License}`;

function OssLicenseBanner() {
  const { license } = useContext(SubscriptionDataContext);
  const { match } = useTenantPathname();
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // Self-hosted plans: keep the global warning behind the same guard as the License page.
  // That page already shows the detailed warning and recovery action.
  if (isCloud || !isDevFeaturesEnabled || !license || match(licensePage)) {
    return null;
  }

  const status = getLicenseStatus(license);

  if (status === 'active') {
    return null;
  }

  const dateFormatter = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  const graceEndsAt = dateFormatter.format(new Date(license.graceEndsAt));

  return (
    <div className={styles.container}>
      <InlineNotification
        severity={status === 'grace_expired' ? 'error' : 'alert'}
        action="tenants.tabs.license"
        href={licensePage}
      >
        {status === 'grace_expired'
          ? t('tenants.license.grace_expired_description', { graceEndsAt })
          : license.refusalReason
            ? t('tenants.license.refresh_refused_description', {
                reason: t(getLicenseRefusalReasonPhraseKey(license.refusalReason)),
                graceEndsAt,
              })
            : t('tenants.license.refresh_expired_description', {
                expiresAt: dateFormatter.format(new Date(license.expiresAt)),
                graceEndsAt,
              })}
      </InlineNotification>
    </div>
  );
}

export default OssLicenseBanner;
