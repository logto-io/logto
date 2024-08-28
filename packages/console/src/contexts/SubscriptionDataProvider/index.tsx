import { noop } from '@silverhand/essentials';
import { createContext, type ReactNode } from 'react';

import { defaultSubscriptionPlan, defaultTenantResponse } from '@/consts';
// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import TenantAccess from '@/containers/TenantAccess';

import { type Context } from './types';

const defaultSubscription = defaultTenantResponse.subscription;

/**
 * This context provides the subscription plans and subscription data of the current tenant.
 * CAUTION: You should only use this data context under the {@link TenantAccess} component
 */
export const SubscriptionDataContext = createContext<Context>({
  subscriptionPlans: [],
  currentPlan: defaultSubscriptionPlan,
  currentSubscription: defaultSubscription,
  onCurrentSubscriptionUpdated: noop,
});

type Props = {
  readonly subscriptionData: Context;
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
