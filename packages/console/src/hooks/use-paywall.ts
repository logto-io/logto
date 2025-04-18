import { ReservedPlanId } from '@logto/schemas';
import { useContext, useMemo } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { isPaidPlan } from '@/utils/subscription';

const usePaywall = () => {
  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const isFreeTenant = planId === ReservedPlanId.Free;
  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  return useMemo(
    () => ({
      isFreeTenant,
      isPaidTenant,
    }),
    [isFreeTenant, isPaidTenant]
  );
};

export default usePaywall;
