import { withAppInsights } from '@logto/app-insights/react';

import PageMeta from '@/components/PageMeta';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';

import Skeleton from '../components/Skeleton';

import PlanQuotaTable from './PlanQuotaTable';

function Subscription() {
  const { data: subscriptionPlans, error } = useSubscriptionPlans();
  const isLoading = !subscriptionPlans && !error;

  if (isLoading) {
    return <Skeleton />;
  }

  if (!subscriptionPlans) {
    return null;
  }

  return (
    <div>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      <PlanQuotaTable subscriptionPlans={subscriptionPlans} />
    </div>
  );
}

export default withAppInsights(Subscription);
