import { type ResponseError } from '@withtyped/client';
import { useContext, useEffect } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantUsageAddOnSkus, type NewSubscriptionPeriodicUsage } from '@/cloud/types/router';
import PageMeta from '@/components/PageMeta';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { pickupFeaturedLogtoSkus } from '@/utils/subscription';

import Skeleton from '../components/Skeleton';

import ConsoleEmbeddedPricing from './ConsoleEmbeddedPricing';
import CurrentPlan from './CurrentPlan';
import SwitchPlanActionBar from './SwitchPlanActionBar';
import styles from './index.module.scss';

function Subscription() {
  const cloudApi = useCloudApi();
  const { logtoSkus, currentSku, onCurrentSubscriptionUpdated } =
    useContext(SubscriptionDataContext);
  const { currentTenantId, updateTenant } = useContext(TenantsContext);

  const reservedSkus = pickupFeaturedLogtoSkus(logtoSkus);

  const { data: periodicUsage, error: periodicUsageError } = useSWR<
    NewSubscriptionPeriodicUsage,
    ResponseError
  >(isCloud && `/api/tenants/${currentTenantId}/subscription/periodic-usage`, async () =>
    cloudApi.get(`/api/tenants/:tenantId/subscription/periodic-usage`, {
      params: { tenantId: currentTenantId },
    })
  );

  const { data: usageAddOnSkus, error: usageAddOnSkusError } = useSWR<
    TenantUsageAddOnSkus,
    ResponseError
  >(isCloud && `/api/tenants/${currentTenantId}/add-on-skus`, async () =>
    cloudApi.get(`/api/tenants/:tenantId/subscription/add-on-skus`, {
      params: { tenantId: currentTenantId },
    })
  );

  const isLoading =
    (!periodicUsage && !periodicUsageError) || (!usageAddOnSkus && !usageAddOnSkusError);

  useEffect(() => {
    if (isCloud) {
      onCurrentSubscriptionUpdated();
    }
  }, [onCurrentSubscriptionUpdated]);

  useEffect(() => {
    if (isCloud && periodicUsage) {
      updateTenant(currentTenantId, {
        usage: {
          activeUsers: periodicUsage.mauLimit,
          tokenUsage: periodicUsage.tokenLimit,
        },
      });
    }
  }, [currentTenantId, periodicUsage, updateTenant]);

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className={styles.container}>
      <PageMeta titleKey={['tenants.tabs.subscription', 'tenants.title']} />
      <CurrentPlan periodicUsage={periodicUsage} usageAddOnSkus={usageAddOnSkus} />
      <ConsoleEmbeddedPricing />
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
