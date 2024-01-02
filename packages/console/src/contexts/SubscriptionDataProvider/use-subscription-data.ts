import { cond, condString } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';

import { defaultSubscriptionPlan, defaultTenantResponse } from '@/consts';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

import useSubscription from '../../hooks/use-subscription';
import useSubscriptionPlans from '../../hooks/use-subscription-plans';

import { type Context } from './types';

const useSubscriptionData: () => Context & { isLoading: boolean } = () => {
  const { currentTenant } = useContext(TenantsContext);
  const { isLoading: isSubscriptionPlansLoading, data: fetchedPlans } = useSubscriptionPlans();
  const {
    data: currentSubscription,
    isLoading: isSubscriptionLoading,
    mutate: mutateSubscription,
  } = useSubscription(condString(currentTenant?.id));

  const subscriptionPlans = useMemo(() => cond(isCloud && fetchedPlans) ?? [], [fetchedPlans]);

  const currentPlan = useMemo(
    () =>
      subscriptionPlans.find((plan) => plan.id === currentTenant?.planId) ??
      defaultSubscriptionPlan,
    [currentTenant?.planId, subscriptionPlans]
  );

  return {
    isLoading: isSubscriptionLoading || isSubscriptionPlansLoading,
    subscriptionPlans,
    currentPlan,
    currentSubscription: currentSubscription ?? defaultTenantResponse.subscription,
    onCurrentSubscriptionUpdated: mutateSubscription,
  };
};

export default useSubscriptionData;
