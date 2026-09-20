import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type LogtoEnterpriseResponse } from '@/cloud/types/router';
import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { EnterpriseSubscriptionTabs } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import AppBoundary from '@/containers/AppBoundary';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useCurrentUser from '@/hooks/use-current-user';

import styles from './index.module.scss';

const buildEnterpriseSubscriptionPathname = (
  logtoEnterpriseId: string,
  tag: EnterpriseSubscriptionTabs
) => `${GlobalRoute.EnterpriseSubscription}/${logtoEnterpriseId}/${tag}`;

function EnterpriseSubscription() {
  const { logtoEnterpriseId: routeEnterpriseId, connectorId } = useParams();
  const { user } = useCurrentUser();
  const api = useCloudApi();
  const { data } = useSWR<{ logtoEnterprises: LogtoEnterpriseResponse[] }, Error>(
    user && ['/api/me/logto-enterprises', user.id],
    async () => api.get('/api/me/logto-enterprises')
  );
  const logtoEnterpriseId = routeEnterpriseId
    ? data?.logtoEnterprises.find(({ id }) => id === routeEnterpriseId)?.id
    : data?.logtoEnterprises[0]?.id;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const subscriptionPathname = buildEnterpriseSubscriptionPathname(
    logtoEnterpriseId ?? '',
    EnterpriseSubscriptionTabs.Subscription
  );
  const billingHistoryPathname = buildEnterpriseSubscriptionPathname(
    logtoEnterpriseId ?? '',
    EnterpriseSubscriptionTabs.BillingHistory
  );

  if (isDevFeaturesEnabled && data && routeEnterpriseId && !logtoEnterpriseId) {
    return <Navigate replace to="/subscriptions/console-sso" />;
  }

  return (
    <AppBoundary>
      <div className={styles.pageContainer}>
        <Topbar hideTenantSelector hideTitle />
        <OverlayScrollbar className={styles.scrollable}>
          <div className={styles.wrapper}>
            <PageMeta titleKey="enterprise_subscription.page_title" />
            <div className={styles.container}>
              {!connectorId && (
                <>
                  <CardTitle
                    className={styles.cardTitle}
                    title="enterprise_subscription.title"
                    subtitle={logtoEnterpriseId ? 'enterprise_subscription.subtitle' : undefined}
                  />
                  <TabNav className={styles.tabs}>
                    {logtoEnterpriseId && (
                      <>
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
                      </>
                    )}
                    {/* Console SSO shares the global Subscription entry. */}
                    {isDevFeaturesEnabled && (
                      <TabNavItem
                        isActive={pathname === '/subscriptions/console-sso'}
                        onClick={() => {
                          navigate('/subscriptions/console-sso');
                        }}
                      >
                        <DynamicT forKey="console_sso.title" />
                      </TabNavItem>
                    )}
                  </TabNav>
                </>
              )}
              <Outlet />
            </div>
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default EnterpriseSubscription;
