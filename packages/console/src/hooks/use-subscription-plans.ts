import { type Optional } from '@silverhand/essentials';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type SubscriptionPlanResponse } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { reservedPlanIdOrder } from '@/consts/subscriptions';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { sortBy } from '@/utils/sort';
import { addSupportQuotaToPlan } from '@/utils/subscription';

const useSubscriptionPlans = () => {
  const cloudApi = useCloudApi();
  const useSwrResponse = useSWRImmutable<SubscriptionPlanResponse[], Error>(
    isCloud && '/api/subscription-plans',
    async () => cloudApi.get('/api/subscription-plans')
  );

  const { data: subscriptionPlansResponse } = useSwrResponse;

  const subscriptionPlans: Optional<SubscriptionPlan[]> = useMemo(() => {
    if (!subscriptionPlansResponse) {
      return;
    }

    return subscriptionPlansResponse
      .map((plan) => addSupportQuotaToPlan(plan))
      .slice()
      .sort(({ id: previousId }, { id: nextId }) =>
        sortBy(reservedPlanIdOrder)(previousId, nextId)
      );
  }, [subscriptionPlansResponse]);

  return {
    ...useSwrResponse,
    data: subscriptionPlans,
  };
};

export default useSubscriptionPlans;
