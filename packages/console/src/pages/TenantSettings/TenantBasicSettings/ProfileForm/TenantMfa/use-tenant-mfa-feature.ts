import { ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';

const useTenantMfaFeature = () => {
  const { isDevTenant } = useContext(TenantsContext);
  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const isFreeOrDevPlan =
    planId === ReservedPlanId.Free || planId === ReservedPlanId.Development || isDevTenant;
  const isFeatureAvailable = !isFreeOrDevPlan || isEnterprisePlan;

  return {
    isFreeOrDevPlan,
    isFeatureAvailable,
  };
};

export default useTenantMfaFeature;
