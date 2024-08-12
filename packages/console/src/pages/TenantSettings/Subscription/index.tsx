import { useContext } from 'react';

import PageMeta from '@/components/PageMeta';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { pickupFeaturedLogtoSkus, pickupFeaturedPlans } from '@/utils/subscription';

import CurrentPlan from './CurrentPlan';
import PlanComparisonTable from './PlanComparisonTable';
import SwitchPlanActionBar from './SwitchPlanActionBar';
import styles from './index.module.scss';

function Subscription() {
  const {
    subscriptionPlans,
    currentPlan,
    logtoSkus,
    currentSku,
    currentSubscription,
    onCurrentSubscriptionUpdated,
  } = useContext(SubscriptionDataContext);

  const reservedPlans = pickupFeaturedPlans(subscriptionPlans);
  const reservedSkus = pickupFeaturedLogtoSkus(logtoSkus);

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      <CurrentPlan subscription={currentSubscription} subscriptionPlan={currentPlan} />
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
        }}
      />
    </div>
  );
}

export default Subscription;
