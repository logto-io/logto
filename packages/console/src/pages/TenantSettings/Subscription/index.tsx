import { useContext } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import PageMeta from '@/components/PageMeta';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { Skeleton } from '@/containers/ConsoleContent/Sidebar';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { pickupFeaturedLogtoSkus, pickupFeaturedPlans } from '@/utils/subscription';

import CurrentPlan from './CurrentPlan';
import PlanComparisonTable from './PlanComparisonTable';
import SwitchPlanActionBar from './SwitchPlanActionBar';
import styles from './index.module.scss';

function Subscription() {
  const cloudApi = useCloudApi();
  const {
    subscriptionPlans,
    currentPlan,
    logtoSkus,
    currentSku,
    currentSubscription,
    onCurrentSubscriptionUpdated,
  } = useContext(SubscriptionDataContext);
  const { currentTenantId } = useContext(TenantsContext);

  const reservedPlans = pickupFeaturedPlans(subscriptionPlans);
  const reservedSkus = pickupFeaturedLogtoSkus(logtoSkus);

  const { data: periodicUsage } = useSWR(
    isCloud &&
      isDevFeaturesEnabled &&
      `/api/tenants/${currentTenantId}/subscription/periodic-usage`,
    async () =>
      cloudApi.get(`/api/tenants/:tenantId/subscription/periodic-usage`, {
        params: { tenantId: currentTenantId },
      })
  );

  if (!periodicUsage) {
    return <Skeleton />;
  }

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      <CurrentPlan
        subscription={currentSubscription}
        subscriptionPlan={currentPlan}
        periodicUsage={periodicUsage}
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
        }}
      />
    </div>
  );
}

export default Subscription;
