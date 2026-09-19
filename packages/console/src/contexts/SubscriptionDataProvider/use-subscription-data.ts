import { pick } from '@silverhand/essentials';
import { useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import {
  type LogtoSkuResponse,
  type SubscriptionCountBasedUsage,
  type SubscriptionQuota,
  type SubscriptionUsageResponse,
} from '@/cloud/types/router';
import { defaultLogtoSku, defaultSubscriptionQuota, defaultSubscriptionUsage } from '@/consts';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { LogtoSkuType } from '@/types/skus';
import { normalizeActionsQuota } from '@/utils/actions';
import { formatLogtoSkusResponses } from '@/utils/subscription';

import useLicense from '../../hooks/use-license';
import useSubscription from '../../hooks/use-subscription';

import { buildSelfHostedSubscription, buildSelfHostedSubscriptionQuota } from './license';
import { type SubscriptionContext } from './types';

const normalizeSubscriptionQuota = (
  quota?: SubscriptionUsageResponse['quota']
): SubscriptionQuota => ({
  ...defaultSubscriptionQuota,
  ...(quota ? normalizeActionsQuota(quota) : {}),
});

const normalizeSubscriptionUsage = (
  usage?: SubscriptionUsageResponse['usage']
): SubscriptionCountBasedUsage => ({
  ...defaultSubscriptionUsage,
  ...(usage ? normalizeActionsQuota(usage) : {}),
});

const useSubscriptionData: () => SubscriptionContext & { isLoading: boolean } = () => {
  const cloudApi = useCloudApi();

  const { currentTenant, currentTenantId, updateTenant } = useContext(TenantsContext);

  const {
    data: cloudSubscription,
    isLoading: isSubscriptionLoading,
    mutate: mutateSubscription,
  } = useSubscription(currentTenantId);

  const { license, isLoading: isLicenseLoading, mutate: mutateLicense } = useLicense();

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

  // Outside Cloud the installed license is the entitlement source, and the Cloud subscription is
  // never fetched. Without a license this is the fixed `dev` plan Console has always assumed.
  const currentSubscription = useMemo(
    () => (isCloud ? cloudSubscription : undefined) ?? buildSelfHostedSubscription(license),
    [cloudSubscription, license]
  );

  const currentSubscriptionQuota = useMemo(
    () =>
      isCloud
        ? normalizeSubscriptionQuota(subscriptionUsageData?.quota)
        : buildSelfHostedSubscriptionQuota(license),
    [license, subscriptionUsageData?.quota]
  );

  const currentSubscriptionBasicQuota = useMemo(
    () => normalizeSubscriptionQuota(subscriptionUsageData?.basicQuota),
    [subscriptionUsageData?.basicQuota]
  );

  const currentSubscriptionUsage = useMemo(
    () => normalizeSubscriptionUsage(subscriptionUsageData?.usage),
    [subscriptionUsageData?.usage]
  );

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
      isLoading:
        isSubscriptionLoading ||
        isLogtoSkusLoading ||
        isSubscriptionUsageDataLoading ||
        isLicenseLoading,
      logtoSkus,
      currentSku,
      currentSubscription,
      onCurrentSubscriptionUpdated: mutateSubscription,
      mutateSubscriptionQuotaAndUsages,
      currentSubscriptionQuota,
      currentSubscriptionBasicQuota,
      currentSubscriptionUsage,
      currentSubscriptionResourceScopeUsage: subscriptionUsageData?.resources ?? {},
      currentSubscriptionRoleScopeUsage: subscriptionUsageData?.roles ?? {},
      license,
      mutateLicense,
    }),
    [
      currentSku,
      currentSubscription,
      currentSubscriptionBasicQuota,
      currentSubscriptionQuota,
      currentSubscriptionUsage,
      isLicenseLoading,
      isLogtoSkusLoading,
      isSubscriptionLoading,
      isSubscriptionUsageDataLoading,
      license,
      logtoSkus,
      mutateLicense,
      mutateSubscription,
      mutateSubscriptionQuotaAndUsages,
      subscriptionUsageData?.resources,
      subscriptionUsageData?.roles,
    ]
  );
};

export default useSubscriptionData;
