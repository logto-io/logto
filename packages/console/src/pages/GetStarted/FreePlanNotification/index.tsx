import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import FreePlanNotificationImage from '@/assets/images/free-plan-notification-image.svg';
import { isCloud } from '@/consts/env';
import { subscriptionPage } from '@/consts/pages';
import { ReservedPlanId } from '@/consts/subscriptions';
import { TenantsContext } from '@/contexts/TenantsProvider';
import TextLink from '@/ds-components/TextLink';
import useSubscription from '@/hooks/use-subscription';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import * as styles from './index.module.scss';

function FreePlanNotification() {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentSubscription, error } = useSubscription(currentTenantId);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.get_started' });
  const { navigate } = useTenantPathname();
  const isLoadingSubscription = !currentSubscription && !error;

  if (
    !isCloud ||
    isLoadingSubscription ||
    !currentSubscription ||
    currentSubscription.planId !== ReservedPlanId.free
  ) {
    return null;
  }

  return (
    <div className={styles.container}>
      <FreePlanNotificationImage className={styles.image} />
      <div>
        <div className={styles.title}>{t('title')}</div>
        <div className={styles.description}>
          <Trans
            components={{
              a: <TextLink to={subscriptionPage} className={styles.textLink} />,
            }}
          >
            {t('description')}
          </Trans>
        </div>
      </div>
    </div>
  );
}

export default FreePlanNotification;
