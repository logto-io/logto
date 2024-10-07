import { useContext, useEffect } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import PageMeta from '@/components/PageMeta';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { pickupFeaturedLogtoSkus } from '@/utils/subscription';

import Skeleton from '../components/Skeleton';

import CurrentPlan from './CurrentPlan';
import PlanComparisonTable from './PlanComparisonTable';
import SwitchPlanActionBar from './SwitchPlanActionBar';
import styles from './index.module.scss';

function Subscription() {
  const cloudApi = useCloudApi();
  const { logtoSkus, currentSku, onCurrentSubscriptionUpdated } =
    useContext(SubscriptionDataContext);
  const { currentTenantId } = useContext(TenantsContext);

  const reservedSkus = pickupFeaturedLogtoSkus(logtoSkus);

  const { data: periodicUsage, isLoading } = useSWR(
    isCloud && `/api/tenants/${currentTenantId}/subscription/periodic-usage`,
    async () =>
      cloudApi.get(`/api/tenants/:tenantId/subscription/periodic-usage`, {
        params: { tenantId: currentTenantId },
      })
  );

  useEffect(() => {
    if (isCloud) {
      onCurrentSubscriptionUpdated();
    }
  }, [onCurrentSubscriptionUpdated]);

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      <CurrentPlan periodicUsage={periodicUsage} />
      <PlanComparisonTable />
      <SwitchPlanActionBar
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
