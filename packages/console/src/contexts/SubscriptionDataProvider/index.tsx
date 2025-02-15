import { noop } from '@silverhand/essentials';
import { createContext, type ReactNode } from 'react';

import {
  defaultLogtoSku,
  defaultTenantResponse,
  defaultSubscriptionQuota,
  defaultSubscriptionUsage,
} from '@/consts';

import { type FullContext } from './types';

const defaultSubscription = defaultTenantResponse.subscription;

/**
 * This context provides the subscription plans and subscription data of the current tenant.
 * CAUTION: You should only use this data context under the {@link TenantAccess} component
 */
export const SubscriptionDataContext = createContext<FullContext>({
  currentSubscription: defaultSubscription,
  onCurrentSubscriptionUpdated: noop,
  /* ==== For new pricing model ==== */
  logtoSkus: [],
  currentSku: defaultLogtoSku,
  currentSubscriptionQuota: defaultSubscriptionQuota,
  currentSubscriptionBasicQuota: defaultSubscriptionQuota,
  currentSubscriptionUsage: defaultSubscriptionUsage,
  currentSubscriptionResourceScopeUsage: {},
  currentSubscriptionRoleScopeUsage: {},
  mutateSubscriptionQuotaAndUsages: noop,
  /* ==== For new pricing model ==== */
  hasSurpassedSubscriptionQuotaLimit: () => false,
  hasReachedSubscriptionQuotaLimit: () => false,
});

type Props = {
  readonly subscriptionDataAndUtils: FullContext;
  readonly children: ReactNode;
};

function SubscriptionDataProvider({ children, subscriptionDataAndUtils }: Props) {
  return (
    <SubscriptionDataContext.Provider value={subscriptionDataAndUtils}>
      {children}
    </SubscriptionDataContext.Provider>
  );
}

export default SubscriptionDataProvider;
