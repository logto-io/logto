import { useMemo } from 'react';

import useSubscription from './use-subscription';
import useSubscriptionPlans from './use-subscription-plans';

const useSubscriptionPlan = (tenantId: string) => {
  const { data: subscription, error: fetchSubscriptionError } = useSubscription(tenantId);
  const { data: subscriptionPlans, error: fetchSubscriptionPlansError } = useSubscriptionPlans();

  const currentPlan = useMemo(
    () => subscriptionPlans?.find(({ id: planId }) => planId === subscription?.planId),
    [subscription?.planId, subscriptionPlans]
  );

  return {
    data: currentPlan,
    error: fetchSubscriptionError ?? fetchSubscriptionPlansError,
  };
};

export default useSubscriptionPlan;
