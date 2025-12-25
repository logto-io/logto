import { Outlet, useParams } from 'react-router-dom';

import { EnterpriseSubscriptionTabs } from '@/consts';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import styles from './index.module.scss';

const buildEnterpriseSubscriptionPathname = (
  logtoEnterpriseId: string,
  tag: EnterpriseSubscriptionTabs
) => `/enterprise-subscriptions/${logtoEnterpriseId}/${tag}`;

function EnterpriseSubscription() {
  const { logtoEnterpriseId } = useParams();

  if (!logtoEnterpriseId) {
    return null;
  }

  return (
    <div className={styles.container}>
      <CardTitle
        className={styles.cardTitle}
        title="enterprise_subscription.title"
        subtitle="enterprise_subscription.subtitle"
      />
      <TabNav className={styles.tabs}>
        <TabNavItem
          href={buildEnterpriseSubscriptionPathname(
            logtoEnterpriseId,
            EnterpriseSubscriptionTabs.Subscription
          )}
        >
          <DynamicT forKey="enterprise_subscription.tab.subscription" />
        </TabNavItem>
        <TabNavItem
          href={buildEnterpriseSubscriptionPathname(
            logtoEnterpriseId,
            EnterpriseSubscriptionTabs.BillingHistory
          )}
        >
          <DynamicT forKey="enterprise_subscription.tab.billing_history" />
        </TabNavItem>
      </TabNav>
      <Outlet />
    </div>
  );
}

export default EnterpriseSubscription;
