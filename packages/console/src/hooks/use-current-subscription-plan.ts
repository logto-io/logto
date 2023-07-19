import { useMemo } from 'react';

import useCurrentSubscription from './use-current-subscription';
import useSubscriptionPlans from './use-subscription-plans';

const useCurrentSubscriptionPlan = () => {
  const { data: subscription, error: fetchSubscriptionError } = useCurrentSubscription();
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

export default useCurrentSubscriptionPlan;
