import { type Optional } from '@silverhand/essentials';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type SubscriptionPlanResponse } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { featuredPlanIdOrder } from '@/consts/subscriptions';
// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import TenantAccess from '@/containers/TenantAccess';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { sortBy } from '@/utils/sort';
import { addSupportQuotaToPlan } from '@/utils/subscription';

/**
 * Fetch subscription plans from the cloud API.
 * Note: If you want to retrieve subscription plans under the {@link TenantAccess} component, use `SubscriptionDataContext` instead.
 */
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
        sortBy(featuredPlanIdOrder)(previousId, nextId)
      );
  }, [subscriptionPlansResponse]);

  return {
    ...useSwrResponse,
    data: subscriptionPlans,
  };
};

export default useSubscriptionPlans;
