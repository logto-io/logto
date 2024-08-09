import { cond, condString } from '@silverhand/essentials';
import { useCallback, useContext, useMemo } from 'react';

import {
  defaultLogtoSku,
  defaultTenantResponse,
  defaultSubscriptionQuota,
  defaultSubscriptionUsage,
} from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useLogtoSkus from '@/hooks/use-logto-skus';
import useNewSubscriptionQuota from '@/hooks/use-new-subscription-quota';
import useNewSubscriptionScopeUsage from '@/hooks/use-new-subscription-scopes-usage';
import useNewSubscriptionUsage from '@/hooks/use-new-subscription-usage';

import useSubscription from '../../hooks/use-subscription';

import { type NewSubscriptionContext } from './types';

const useNewSubscriptionData: () => NewSubscriptionContext & { isLoading: boolean } = () => {
  const { currentTenant } = useContext(TenantsContext);
  const { isLoading: isLogtoSkusLoading, data: fetchedLogtoSkus } = useLogtoSkus();
  const {
    data: currentSubscription,
    isLoading: isSubscriptionLoading,
    mutate: mutateSubscription,
  } = useSubscription(condString(currentTenant?.id));

  const {
    data: currentSubscriptionQuota,
    isLoading: isSubscriptionQuotaLoading,
    mutate: mutateSubscriptionQuota,
  } = useNewSubscriptionQuota(condString(currentTenant?.id));

  const {
    data: currentSubscriptionUsage,
    isLoading: isSubscriptionUsageLoading,
    mutate: mutateSubscriptionUsage,
  } = useNewSubscriptionUsage(condString(currentTenant?.id));

  const {
    scopeResourceUsage: {
      data: scopeResourceUsage,
      isLoading: isScopePerResourceUsageLoading,
      mutate: mutateScopeResourceUsage,
    },
    scopeRoleUsage: {
      data: scopeRoleUsage,
      isLoading: isScopePerRoleUsageLoading,
      mutate: mutateScopeRoleUsage,
    },
  } = useNewSubscriptionScopeUsage(condString(currentTenant?.id));

  const mutateSubscriptionQuotaAndUsages = useCallback(() => {
    if (!isDevFeaturesEnabled) {
      return;
    }

    void mutateSubscriptionQuota();
    void mutateSubscriptionUsage();
    void mutateScopeResourceUsage();
    void mutateScopeRoleUsage();
  }, [
    mutateScopeResourceUsage,
    mutateScopeRoleUsage,
    mutateSubscriptionQuota,
    mutateSubscriptionUsage,
  ]);

  const logtoSkus = useMemo(() => cond(isCloud && fetchedLogtoSkus) ?? [], [fetchedLogtoSkus]);

  const currentSku = useMemo(
    () => logtoSkus.find((logtoSku) => logtoSku.id === currentTenant?.planId) ?? defaultLogtoSku,
    [currentTenant?.planId, logtoSkus]
  );

  return {
    isLoading:
      isSubscriptionLoading ||
      isLogtoSkusLoading ||
      isSubscriptionQuotaLoading ||
      isSubscriptionUsageLoading ||
      isScopePerResourceUsageLoading ||
      isScopePerRoleUsageLoading,
    logtoSkus,
    currentSku,
    currentSubscription: currentSubscription ?? defaultTenantResponse.subscription,
    onCurrentSubscriptionUpdated: mutateSubscription,
    mutateSubscriptionQuotaAndUsages,
    currentSubscriptionQuota: currentSubscriptionQuota ?? defaultSubscriptionQuota,
    currentSubscriptionUsage: currentSubscriptionUsage ?? defaultSubscriptionUsage,
    currentSubscriptionScopeResourceUsage: scopeResourceUsage ?? {},
    currentSubscriptionScopeRoleUsage: scopeRoleUsage ?? {},
  };
};

export default useNewSubscriptionData;
