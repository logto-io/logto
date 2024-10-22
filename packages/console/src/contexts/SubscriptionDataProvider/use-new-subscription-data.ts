import { cond, pick } from '@silverhand/essentials';
import { useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type NewSubscriptionUsageResponse } from '@/cloud/types/router';
import {
  defaultLogtoSku,
  defaultTenantResponse,
  defaultSubscriptionQuota,
  defaultSubscriptionUsage,
} from '@/consts';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useLogtoSkus from '@/hooks/use-logto-skus';

import useSubscription from '../../hooks/use-subscription';

import { type NewSubscriptionContext } from './types';

const useNewSubscriptionData: () => NewSubscriptionContext & { isLoading: boolean } = () => {
  const cloudApi = useCloudApi();

  const { currentTenant, currentTenantId, updateTenant } = useContext(TenantsContext);
  const { isLoading: isLogtoSkusLoading, data: fetchedLogtoSkus } = useLogtoSkus();

  const {
    data: currentSubscription,
    isLoading: isSubscriptionLoading,
    mutate: mutateSubscription,
  } = useSubscription(currentTenantId);

  const {
    data: subscriptionUsageData,
    isLoading: isSubscriptionUsageDataLoading,
    mutate: mutateSubscriptionQuotaAndUsages,
  } = useSWR<NewSubscriptionUsageResponse, Error>(
    isCloud && currentTenantId && `/api/tenants/${currentTenantId}/subscription-usage`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription-usage', {
        params: { tenantId: currentTenantId },
      })
  );

  const logtoSkus = useMemo(() => cond(isCloud && fetchedLogtoSkus) ?? [], [fetchedLogtoSkus]);

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
    // Since `updateTenant` updates `tenants` in TenantsContext and triggers re-renders (`updateTenant` is re-rendered as well),
    // we can not add `updateTenant` to the dependency list, otherwise it will cause a infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenantId, subscriptionUsageData?.quota]);

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

export default useNewSubscriptionData;
