import { useMemo } from 'react';

import { communitySupportEnabledMap, ticketSupportResponseTimeMap } from '@/consts/subscriptions';
import { type SubscriptionPlan } from '@/types/subscriptions';

import { useCloudSwr } from '../cloud/hooks/use-cloud-swr';

const useSubscriptionPlans = () => {
  const { data: subscriptionPlansResponse, error } = useCloudSwr('/api/subscription-plans');

  const subscriptionPlans: SubscriptionPlan[] = useMemo(
    () =>
      subscriptionPlansResponse?.map((plan) => {
        const { name, quota } = plan;

        return {
          ...plan,
          quota: {
            ...quota,
            communitySupportEnabled: communitySupportEnabledMap[name] ?? false, // Fallback to not supported
            ticketSupportResponseTime: ticketSupportResponseTimeMap[name] ?? 0, // Fallback to not supported
          },
        };
      }) ?? [],
    [subscriptionPlansResponse]
  );

  return {
    isLoading: !subscriptionPlansResponse && !error,
    data: subscriptionPlans,
  };
};

export default useSubscriptionPlans;
