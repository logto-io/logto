import { noop } from '@silverhand/essentials';
import { createContext, type ReactNode } from 'react';

import {
  defaultSubscriptionPlan,
  defaultLogtoSku,
  defaultTenantResponse,
  defaultSubscriptionQuota,
  defaultSubscriptionUsage,
} from '@/consts';
// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import TenantAccess from '@/containers/TenantAccess';

import { type FullContext } from './types';

const defaultSubscription = defaultTenantResponse.subscription;

/**
 * This context provides the subscription plans and subscription data of the current tenant.
 * CAUTION: You should only use this data context under the {@link TenantAccess} component
 */
export const SubscriptionDataContext = createContext<FullContext>({
  subscriptionPlans: [],
  currentPlan: defaultSubscriptionPlan,
  currentSubscription: defaultSubscription,
  onCurrentSubscriptionUpdated: noop,
  /* ==== For new pricing model ==== */
  logtoSkus: [],
  currentSku: defaultLogtoSku,
  currentSubscriptionQuota: defaultSubscriptionQuota,
  currentSubscriptionUsage: defaultSubscriptionUsage,
  currentSubscriptionScopeResourceUsage: {},
  currentSubscriptionScopeRoleUsage: {},
  /* ==== For new pricing model ==== */
});

type Props = {
  readonly subscriptionData: FullContext;
  readonly children: ReactNode;
};

function SubscriptionDataProvider({ children, subscriptionData }: Props) {
  return (
    <SubscriptionDataContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionDataContext.Provider>
  );
}

export default SubscriptionDataProvider;
