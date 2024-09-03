import { useContext } from 'react';

import PageMeta from '@/components/PageMeta';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useSubscriptionUsage from '@/hooks/use-subscription-usage';
import { pickupFeaturedLogtoSkus, pickupFeaturedPlans } from '@/utils/subscription';

import Skeleton from '../components/Skeleton';

import CurrentPlan from './CurrentPlan';
import PlanComparisonTable from './PlanComparisonTable';
import SwitchPlanActionBar from './SwitchPlanActionBar';
import styles from './index.module.scss';

function Subscription() {
  const { currentTenantId } = useContext(TenantsContext);
  const {
    subscriptionPlans,
    currentPlan,
    logtoSkus,
    currentSku,
    currentSubscription,
    onCurrentSubscriptionUpdated,
  } = useContext(SubscriptionDataContext);

  const {
    data: subscriptionUsage,
    isLoading,
    mutate: mutateSubscriptionUsage,
  } = useSubscriptionUsage(currentTenantId);

  const reservedPlans = pickupFeaturedPlans(subscriptionPlans);
  const reservedSkus = pickupFeaturedLogtoSkus(logtoSkus);

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
      <PlanComparisonTable />
      <SwitchPlanActionBar
        currentSubscriptionPlanId={currentSubscription.planId}
        subscriptionPlans={reservedPlans}
        currentSkuId={currentSku.id}
        logtoSkus={reservedSkus}
        onSubscriptionUpdated={async () => {
          /**
           * The upcoming billing info is calculated based on the current subscription usage,
           * and the usage is based on the current subscription plan,
           * need to manually trigger the usage update while the subscription plan is changed.
           */
          onCurrentSubscriptionUpdated();
          await mutateSubscriptionUsage();
        }}
      />
    </div>
  );
}

export default Subscription;
