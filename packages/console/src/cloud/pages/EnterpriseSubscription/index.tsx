import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { EnterpriseSubscriptionTabs } from '@/consts';
import AppBoundary from '@/containers/AppBoundary';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import styles from './index.module.scss';

const buildEnterpriseSubscriptionPathname = (
  logtoEnterpriseId: string,
  tag: EnterpriseSubscriptionTabs
) => `${GlobalRoute.EnterpriseSubscription}/${logtoEnterpriseId}/${tag}`;

function EnterpriseSubscription() {
  const { logtoEnterpriseId } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!logtoEnterpriseId) {
    return null;
  }

  const subscriptionPathname = buildEnterpriseSubscriptionPathname(
    logtoEnterpriseId,
    EnterpriseSubscriptionTabs.Subscription
  );
  const billingHistoryPathname = buildEnterpriseSubscriptionPathname(
    logtoEnterpriseId,
    EnterpriseSubscriptionTabs.BillingHistory
  );

  return (
    <AppBoundary>
      <div className={styles.pageContainer}>
        <Topbar hideTenantSelector hideTitle />
        <OverlayScrollbar className={styles.scrollable}>
          <div className={styles.wrapper}>
            <PageMeta titleKey="enterprise_subscription.page_title" />
            <div className={styles.container}>
              <CardTitle
                className={styles.cardTitle}
                title="enterprise_subscription.title"
                subtitle="enterprise_subscription.subtitle"
              />
              <TabNav className={styles.tabs}>
                <TabNavItem
                  isActive={pathname === subscriptionPathname}
                  onClick={() => {
                    navigate(subscriptionPathname);
                  }}
                >
                  <DynamicT forKey="enterprise_subscription.tab.subscription" />
                </TabNavItem>
                <TabNavItem
                  isActive={pathname === billingHistoryPathname}
                  onClick={() => {
                    navigate(billingHistoryPathname);
                  }}
                >
                  <DynamicT forKey="enterprise_subscription.tab.billing_history" />
                </TabNavItem>
              </TabNav>
              <Outlet />
            </div>
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default EnterpriseSubscription;
