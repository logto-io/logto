import { pick } from '@silverhand/essentials';
import { useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type LogtoSkuResponse, type SubscriptionUsageResponse } from '@/cloud/types/router';
import {
  defaultLogtoSku,
  defaultTenantResponse,
  defaultSubscriptionQuota,
  defaultSubscriptionUsage,
} from '@/consts';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { LogtoSkuType } from '@/types/skus';
import { formatLogtoSkusResponses } from '@/utils/subscription';

import useSubscription from '../../hooks/use-subscription';

import { type SubscriptionContext } from './types';

const useSubscriptionData: () => SubscriptionContext & { isLoading: boolean } = () => {
  const cloudApi = useCloudApi();

  const { currentTenant, currentTenantId, updateTenant } = useContext(TenantsContext);

  const {
    data: currentSubscription,
    isLoading: isSubscriptionLoading,
    mutate: mutateSubscription,
  } = useSubscription(currentTenantId);

  const {
    data: subscriptionUsageData,
    isLoading: isSubscriptionUsageDataLoading,
    mutate: mutateSubscriptionQuotaAndUsages,
  } = useSWR<SubscriptionUsageResponse, Error>(
    isCloud && currentTenantId && `/api/tenants/${currentTenantId}/subscription-usage`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription-usage', {
        params: { tenantId: currentTenantId },
      })
  );

  // Fetch tenant specific available SKUs
  // Unlike the `useLogtoSkus` hook, apart from public available SKUs, this hook also fetches tenant specific private SKUs
  // For enterprise tenants who have their own private SKUs, and all grandfathered plan tenants,
  // this is the only place to retrieve their current SKU data.
  const { isLoading: isLogtoSkusLoading, data: fetchedLogtoSkus } = useSWR<
    LogtoSkuResponse[],
    Error
  >(isCloud && currentTenantId && `/api/tenants/${currentTenantId}/available-skus`, async () =>
    cloudApi.get('/api/tenants/:tenantId/available-skus', {
      params: { tenantId: currentTenantId },
      search: { type: LogtoSkuType.Basic },
    })
  );

  const logtoSkus = useMemo(() => formatLogtoSkusResponses(fetchedLogtoSkus), [fetchedLogtoSkus]);

  const currentSku = useMemo(
    () => logtoSkus.find((logtoSku) => logtoSku.id === currentTenant?.planId) ?? defaultLogtoSku,
    [currentTenant?.planId, logtoSkus]
  );

  useEffect(() => {
    if (subscriptionUsageData?.quota) {
      updateTenant(currentTenantId, {
        quota: pick(subscriptionUsageData.quota, 'mauLimit', 'tokenLimit'),
      });
    }
  }, [currentTenantId, subscriptionUsageData?.quota, updateTenant]);

  return useMemo(
    () => ({
      isLoading: isSubscriptionLoading || isLogtoSkusLoading || isSubscriptionUsageDataLoading,
      logtoSkus,
      currentSku,
      currentSubscription: currentSubscription ?? defaultTenantResponse.subscription,
      onCurrentSubscriptionUpdated: mutateSubscription,
      mutateSubscriptionQuotaAndUsages,
      currentSubscriptionQuota: subscriptionUsageData?.quota ?? defaultSubscriptionQuota,
      currentSubscriptionBasicQuota: subscriptionUsageData?.basicQuota ?? defaultSubscriptionQuota,
      currentSubscriptionUsage: subscriptionUsageData?.usage ?? defaultSubscriptionUsage,
      currentSubscriptionResourceScopeUsage: subscriptionUsageData?.resources ?? {},
      currentSubscriptionRoleScopeUsage: subscriptionUsageData?.roles ?? {},
    }),
    [
      currentSku,
      currentSubscription,
      isLogtoSkusLoading,
      isSubscriptionLoading,
      isSubscriptionUsageDataLoading,
      logtoSkus,
      mutateSubscription,
      mutateSubscriptionQuotaAndUsages,
      subscriptionUsageData?.quota,
      subscriptionUsageData?.basicQuota,
      subscriptionUsageData?.resources,
      subscriptionUsageData?.roles,
      subscriptionUsageData?.usage,
    ]
  );
};

export default useSubscriptionData;
