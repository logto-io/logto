import { useContext, useMemo } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import {
  hasReachedSubscriptionQuotaLimit,
  hasSurpassedSubscriptionQuotaLimit,
} from '@/utils/quota';

const useApplicationsUsage = () => {
  const { currentSubscriptionQuota, currentSubscriptionUsage } =
    useContext(SubscriptionDataContext);

  const hasMachineToMachineAppsReachedLimit = useMemo(
    () =>
      hasReachedSubscriptionQuotaLimit({
        quotaKey: 'machineToMachineLimit',
        usage: currentSubscriptionUsage.machineToMachineLimit,
        quota: currentSubscriptionQuota,
      }),
    [currentSubscriptionUsage.machineToMachineLimit, currentSubscriptionQuota]
  );

  const hasMachineToMachineAppsSurpassedLimit = useMemo(
    () =>
      hasSurpassedSubscriptionQuotaLimit({
        quotaKey: 'machineToMachineLimit',
        usage: currentSubscriptionUsage.machineToMachineLimit,
        quota: currentSubscriptionQuota,
      }),
    [currentSubscriptionUsage.machineToMachineLimit, currentSubscriptionQuota]
  );

  const hasThirdPartyAppsReachedLimit = useMemo(
    () =>
      hasReachedSubscriptionQuotaLimit({
        quotaKey: 'thirdPartyApplicationsLimit',
        usage: currentSubscriptionUsage.thirdPartyApplicationsLimit,
        quota: currentSubscriptionQuota,
      }),
    [currentSubscriptionUsage.thirdPartyApplicationsLimit, currentSubscriptionQuota]
  );

  const hasAppsReachedLimit = useMemo(
    () =>
      hasReachedSubscriptionQuotaLimit({
        quotaKey: 'applicationsLimit',
        usage: currentSubscriptionUsage.applicationsLimit,
        quota: currentSubscriptionQuota,
      }),
    [currentSubscriptionUsage.applicationsLimit, currentSubscriptionQuota]
  );

  return {
    hasMachineToMachineAppsReachedLimit,
    hasMachineToMachineAppsSurpassedLimit,
    hasAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
  };
};

export default useApplicationsUsage;
