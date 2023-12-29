import { withAppInsights } from '@logto/app-insights/react';
import { useContext } from 'react';

import PageMeta from '@/components/PageMeta';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useSubscriptionUsage from '@/hooks/use-subscription-usage';
import { pickupFeaturedPlans } from '@/utils/subscription';

import Skeleton from '../components/Skeleton';

import CurrentPlan from './CurrentPlan';
import PlanComparisonTable from './PlanComparisonTable';
import SwitchPlanActionBar from './SwitchPlanActionBar';
import * as styles from './index.module.scss';

function Subscription() {
  const { currentTenantId } = useContext(TenantsContext);
  const { subscriptionPlans, currentPlan, currentSubscription, onCurrentSubscriptionUpdated } =
    useContext(SubscriptionDataContext);

  const { data: subscriptionUsage, isLoading } = useSubscriptionUsage(currentTenantId);

  const reservedPlans = pickupFeaturedPlans(subscriptionPlans);

  if (isLoading) {
    return <Skeleton />;
  }

  if (!subscriptionUsage) {
    return null;
  }

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      <CurrentPlan
        subscription={currentSubscription}
        subscriptionPlan={currentPlan}
        subscriptionUsage={subscriptionUsage}
      />
      <PlanComparisonTable subscriptionPlans={reservedPlans} />
      <SwitchPlanActionBar
        currentSubscriptionPlanId={currentSubscription.planId}
        subscriptionPlans={reservedPlans}
        onSubscriptionUpdated={onCurrentSubscriptionUpdated}
      />
    </div>
  );
}

export default withAppInsights(Subscription);
