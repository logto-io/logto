import classNames from 'classnames';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import TextLink from '@/ds-components/TextLink';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

function UpsellNotice() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const { currentSubscriptionQuota } = useContext(SubscriptionDataContext);
  const isBringYourUiEnabled = currentSubscriptionQuota.bringYourUiEnabled;

  if (!isCloud || isBringYourUiEnabled) {
    return null;
  }

  return (
    <div className={classNames(styles.inlineNotification, styles.info, styles.plain)}>
      <div className={styles.content}>{t('upsell.paywall.branding_customization')}</div>
      <div className={styles.action}>
        <TextLink
          onClick={() => {
            navigate('/tenant-settings/subscription');
          }}
        >
          {t('upsell.view_plans')}
        </TextLink>
      </div>
    </div>
  );
}

export default UpsellNotice;
