import { conditional, joinPath } from '@silverhand/essentials';
import { useContext, useRef } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { type SubscriptionCountBasedUsage } from '@/cloud/types/router';
import AppLoading from '@/components/AppLoading';
import Topbar from '@/components/Topbar';
import { isCloud } from '@/consts/env';
import SubscriptionDataProvider from '@/contexts/SubscriptionDataProvider';
import useSubscriptionData from '@/contexts/SubscriptionDataProvider/use-subscription-data';
import {
  hasSurpassedSubscriptionQuotaLimit,
  hasReachedSubscriptionQuotaLimit,
} from '@/contexts/SubscriptionDataProvider/utils';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useScroll from '@/hooks/use-scroll';
import useUserPreferences from '@/hooks/use-user-preferences';
import { shouldEnforcePaywallInUI } from '@/utils/paywall';

import { getPath } from '../ConsoleContent/Sidebar';
import { useSidebarMenuItems } from '../ConsoleContent/Sidebar/hook';

import TenantNotificationContainer from './TenantNotificationContainer';
import TenantSuspendedPage from './TenantSuspendedPage';
import styles from './index.module.scss';
import { type AppContentOutletContext } from './types';

export default function AppContent() {
  const { isLoading: isLoadingPreference } = useUserPreferences();
  const { currentTenant, isDevTenant } = useContext(TenantsContext);
  const isTenantSuspended = isCloud && currentTenant?.isSuspended;

  const { isLoading: isLoadingSubscriptionData, ...subscriptionData } = useSubscriptionData();

  const scrollableContent = useRef<HTMLDivElement>(null);
  const { scrollTop } = useScroll(scrollableContent.current);

  const isLoading = isLoadingPreference || isLoadingSubscriptionData;

  if (isLoading || !currentTenant) {
    return <AppLoading />;
  }

  return (
    <SubscriptionDataProvider
      subscriptionDataAndUtils={{
        ...subscriptionData,
        hasSurpassedSubscriptionQuotaLimit: <T extends keyof SubscriptionCountBasedUsage>(
          quotaKey: T,
          usage?: SubscriptionCountBasedUsage[T]
        ) => {
          if (!shouldEnforcePaywallInUI(isDevTenant, quotaKey)) {
            return false;
          }

          return hasSurpassedSubscriptionQuotaLimit({
            quotaKey,
            usage,
            subscriptionUsage: subscriptionData.currentSubscriptionUsage,
            subscriptionQuota: subscriptionData.currentSubscriptionQuota,
          });
        },
        hasReachedSubscriptionQuotaLimit: <T extends keyof SubscriptionCountBasedUsage>(
          quotaKey: T,
          usage?: SubscriptionCountBasedUsage[T]
        ) => {
          if (!shouldEnforcePaywallInUI(isDevTenant, quotaKey)) {
            return false;
          }

          return hasReachedSubscriptionQuotaLimit({
            quotaKey,
            usage,
            subscriptionUsage: subscriptionData.currentSubscriptionUsage,
            subscriptionQuota: subscriptionData.currentSubscriptionQuota,
          });
        },
      }}
    >
      <div className={styles.app}>
        <Topbar className={conditional(scrollTop && styles.topbarShadow)} />
        {isTenantSuspended && <TenantSuspendedPage />}
        {!isTenantSuspended && (
          <Outlet context={{ scrollableContent } satisfies AppContentOutletContext} />
        )}
      </div>
      <TenantNotificationContainer />
    </SubscriptionDataProvider>
  );
}

export function RedirectToFirstItem() {
  const { tenantId } = useParams();
  const { firstItem } = useSidebarMenuItems();

  if (!firstItem) {
    throw new Error('First sidebar item not found');
  }

  if (!tenantId) {
    throw new Error('Tenant ID not found');
  }

  return <Navigate replace to={joinPath(tenantId, getPath(firstItem.title))} />;
}
