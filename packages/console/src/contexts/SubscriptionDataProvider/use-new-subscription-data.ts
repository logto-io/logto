import { cond, condString } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
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

  const { currentTenant } = useContext(TenantsContext);
  const { isLoading: isLogtoSkusLoading, data: fetchedLogtoSkus } = useLogtoSkus();
  const tenantId = condString(currentTenant?.id);

  const {
    data: currentSubscription,
    isLoading: isSubscriptionLoading,
    mutate: mutateSubscription,
  } = useSubscription(tenantId);

  const {
    data: subscriptionUsageData,
    isLoading: isSubscriptionUsageDataLoading,
    mutate: mutateSubscriptionQuotaAndUsages,
  } = useSWR<NewSubscriptionUsageResponse, Error>(
    isCloud && tenantId && `/api/tenants/${tenantId}/subscription-usage`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription-usage', {
        params: { tenantId },
      })
  );

  const logtoSkus = useMemo(() => cond(isCloud && fetchedLogtoSkus) ?? [], [fetchedLogtoSkus]);

  const currentSku = useMemo(
    () => logtoSkus.find((logtoSku) => logtoSku.id === currentTenant?.planId) ?? defaultLogtoSku,
    [currentTenant?.planId, logtoSkus]
  );

  return useMemo(
    () => ({
      isLoading: isSubscriptionLoading || isLogtoSkusLoading || isSubscriptionUsageDataLoading,
      logtoSkus,
      currentSku,
      currentSubscription: currentSubscription ?? defaultTenantResponse.subscription,
      onCurrentSubscriptionUpdated: mutateSubscription,
      mutateSubscriptionQuotaAndUsages,
      currentSubscriptionQuota: subscriptionUsageData?.quota ?? defaultSubscriptionQuota,
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
      subscriptionUsageData?.resources,
      subscriptionUsageData?.roles,
      subscriptionUsageData?.usage,
    ]
  );
};

export default useNewSubscriptionData;
