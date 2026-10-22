import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useSubscriptionEntry } from '@/cloud/hooks/use-user-subscriptions';
import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { EnterpriseSubscriptionTabs } from '@/consts';
import { contactEmailLink } from '@/consts/external-links';
import AppBoundary from '@/containers/AppBoundary';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TextLink from '@/ds-components/TextLink';

import layout from '../EnterpriseSubscription/index.module.scss';

import styles from './index.module.scss';
import { type UserSubscriptionsOutletContext } from './types';

const tabs = [
  [EnterpriseSubscriptionTabs.Subscription, 'enterprise_subscription.tab.subscription'],
  [EnterpriseSubscriptionTabs.BillingHistory, 'enterprise_subscription.tab.billing_history'],
] as const;

function UserSubscriptions() {
  const { enterprises } = useSubscriptionEntry();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <AppBoundary>
      <div className={layout.pageContainer}>
        <PageMeta titleKey="enterprise_subscription.page_title" />
        <Topbar hideTenantSelector hideTitle />
        <OverlayScrollbar className={layout.scrollable}>
          <div className={layout.wrapper}>
            <CardTitle
              className={layout.cardTitle}
              title="enterprise_subscription.title"
              subtitle="enterprise_subscription.user_subscriptions.description"
            />
            <TabNav className={layout.tabs}>
              {tabs.map(([tab, phrase]) => {
                const tabPathname = `${GlobalRoute.EnterpriseSubscription}/${tab}`;
                return (
                  <TabNavItem
                    key={tab}
                    isActive={pathname === tabPathname}
                    onClick={() => {
                      navigate(tabPathname);
                    }}
                  >
                    <DynamicT forKey={phrase} />
                  </TabNavItem>
                );
              })}
            </TabNav>
            <div className={styles.content}>
              {enterprises.error && (
                <InlineNotification
                  severity="error"
                  action="general.retry"
                  onClick={() => {
                    void enterprises.mutate();
                  }}
                >
                  {enterprises.error.message}
                </InlineNotification>
              )}
              <Outlet
                context={
                  {
                    enterprise: enterprises.data?.[0],
                  } satisfies UserSubscriptionsOutletContext
                }
              />
              <TextLink href={contactEmailLink}>
                <DynamicT forKey="general.contact_us_action" />
              </TextLink>
            </div>
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default UserSubscriptions;
