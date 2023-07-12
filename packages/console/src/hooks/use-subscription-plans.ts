import { type Optional } from '@silverhand/essentials';
import { useMemo } from 'react';

import { communitySupportEnabledMap, ticketSupportResponseTimeMap } from '@/consts/subscriptions';
import { type SubscriptionPlan } from '@/types/subscriptions';

import { useCloudSwr } from '../cloud/hooks/use-cloud-swr';

const useSubscriptionPlans = () => {
  const { data: subscriptionPlansResponse, error } = useCloudSwr('/api/subscription-plans');

  const subscriptionPlans: Optional<SubscriptionPlan[]> = useMemo(() => {
    if (!subscriptionPlansResponse) {
      return;
    }

    return subscriptionPlansResponse.map((plan) => {
      const { name, quota } = plan;

      return {
        ...plan,
        quota: {
          ...quota,
          communitySupportEnabled: communitySupportEnabledMap[name] ?? false, // Fallback to not supported
          ticketSupportResponseTime: ticketSupportResponseTimeMap[name] ?? 0, // Fallback to not supported
        },
      };
    });
  }, [subscriptionPlansResponse]);

  return {
    data: subscriptionPlans,
    error,
  };
};

export default useSubscriptionPlans;
