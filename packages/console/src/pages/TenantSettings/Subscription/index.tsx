import { withAppInsights } from '@logto/app-insights/react';

import PageMeta from '@/components/PageMeta';
import { ReservedPlanId } from '@/consts/subscriptions';
import useCurrentSubscription from '@/hooks/use-current-subscription';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';

import Skeleton from '../components/Skeleton';

import PlanQuotaTable from './PlanQuotaTable';
import SwitchPlanActionBar from './SwitchPlanActionBar';

function Subscription() {
  const { data: subscriptionPlans, isLoading: isLoadingPlans } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useCurrentSubscription();

  if (isLoadingPlans || isLoadingSubscription) {
    return <Skeleton />;
  }

  if (!subscriptionPlans) {
    return null;
  }

  return (
    <div>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      <PlanQuotaTable subscriptionPlans={subscriptionPlans} />
      <SwitchPlanActionBar
        // Todo @xiaoyijun remove this fallback since we'll have a default subscription later
        currentSubscriptionPlanId={currentSubscription?.planId ?? ReservedPlanId.free}
        subscriptionPlans={subscriptionPlans}
      />
    </div>
  );
}

export default withAppInsights(Subscription);
