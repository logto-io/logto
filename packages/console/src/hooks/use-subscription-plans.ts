import { type Optional } from '@silverhand/essentials';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type SubscriptionPlanResponse } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { reservedPlanIdOrder } from '@/consts/subscriptions';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { addSupportQuotaToPlan } from '@/utils/subscription';

const useSubscriptionPlans = () => {
  const cloudApi = useCloudApi();
  const { data: subscriptionPlansResponse, error } = useSWRImmutable<
    SubscriptionPlanResponse[],
    Error
  >(isCloud && '/api/subscription-plans', async () => cloudApi.get('/api/subscription-plans'));

  const subscriptionPlans: Optional<SubscriptionPlan[]> = useMemo(() => {
    if (!subscriptionPlansResponse) {
      return;
    }

    return subscriptionPlansResponse
      .map((plan) => addSupportQuotaToPlan(plan))
      .slice()
      .sort(({ id: previousId }, { id: nextId }) => {
        const previousIndex = reservedPlanIdOrder.indexOf(previousId);
        const nextIndex = reservedPlanIdOrder.indexOf(nextId);

        if (previousIndex === -1 && nextIndex === -1) {
          // Note: If both plan ids not present in `reservedPlanIdOrder`, sort them in default order
          return 0;
        }

        if (previousIndex === -1) {
          // Note: If only the previous plan has an id not present in `reservedPlanIdOrder`, move it to the end
          return 1;
        }

        if (nextIndex === -1) {
          // Note: If only the next plan has an id not present in `reservedPlanIdOrder`, move it to the end
          return -1;
        }

        // Note: Compare them based on the index in the `reservedPlanIdOrder` array
        return previousIndex - nextIndex;
      });
  }, [subscriptionPlansResponse]);

  return {
    data: subscriptionPlans,
    error,
    isLoading: !subscriptionPlans && !error,
  };
};

export default useSubscriptionPlans;
