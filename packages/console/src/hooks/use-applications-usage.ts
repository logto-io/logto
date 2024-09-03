import { type Application, ApplicationType } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import {
  hasReachedQuotaLimit,
  hasReachedSubscriptionQuotaLimit,
  hasSurpassedQuotaLimit,
  hasSurpassedSubscriptionQuotaLimit,
} from '@/utils/quota';

const useApplicationsUsage = () => {
  const { currentPlan, currentSubscriptionQuota, currentSubscriptionUsage } =
    useContext(SubscriptionDataContext);

  /**
   * Note: we only need to fetch all applications when the user is in cloud environment.
   * The oss version doesn't have the quota limit.
   */
  const { data: allApplications } = useSWR<Application[]>(isCloud && 'api/applications');

  const m2mAppCount = useMemo(
    () =>
      isDevFeaturesEnabled
        ? currentSubscriptionUsage.machineToMachineLimit
        : allApplications?.filter(({ type }) => type === ApplicationType.MachineToMachine).length ??
          0,
    [allApplications, currentSubscriptionUsage.machineToMachineLimit]
  );

  const thirdPartyAppCount = useMemo(
    () =>
      isDevFeaturesEnabled
        ? currentSubscriptionUsage.thirdPartyApplicationsLimit
        : allApplications?.filter(({ isThirdParty }) => isThirdParty).length ?? 0,
    [allApplications, currentSubscriptionUsage.thirdPartyApplicationsLimit]
  );

  const hasMachineToMachineAppsReachedLimit = useMemo(
    () =>
      isDevFeaturesEnabled
        ? hasReachedSubscriptionQuotaLimit({
            quotaKey: 'machineToMachineLimit',
            usage: currentSubscriptionUsage.machineToMachineLimit,
            quota: currentSubscriptionQuota,
          })
        : hasReachedQuotaLimit({
            quotaKey: 'machineToMachineLimit',
            plan: currentPlan,
            usage: m2mAppCount,
          }),
    [
      currentPlan,
      m2mAppCount,
      currentSubscriptionUsage.machineToMachineLimit,
      currentSubscriptionQuota,
    ]
  );

  const hasMachineToMachineAppsSurpassedLimit = useMemo(
    () =>
      isDevFeaturesEnabled
        ? hasSurpassedSubscriptionQuotaLimit({
            quotaKey: 'machineToMachineLimit',
            usage: currentSubscriptionUsage.machineToMachineLimit,
            quota: currentSubscriptionQuota,
          })
        : hasSurpassedQuotaLimit({
            quotaKey: 'machineToMachineLimit',
            plan: currentPlan,
            usage: m2mAppCount,
          }),
    [
      currentPlan,
      m2mAppCount,
      currentSubscriptionUsage.machineToMachineLimit,
      currentSubscriptionQuota,
    ]
  );

  const hasThirdPartyAppsReachedLimit = useMemo(
    () =>
      isDevFeaturesEnabled
        ? hasReachedSubscriptionQuotaLimit({
            quotaKey: 'thirdPartyApplicationsLimit',
            usage: currentSubscriptionUsage.thirdPartyApplicationsLimit,
            quota: currentSubscriptionQuota,
          })
        : hasReachedQuotaLimit({
            quotaKey: 'thirdPartyApplicationsLimit',
            plan: currentPlan,
            usage: thirdPartyAppCount,
          }),
    [
      currentPlan,
      thirdPartyAppCount,
      currentSubscriptionUsage.thirdPartyApplicationsLimit,
      currentSubscriptionQuota,
    ]
  );

  const hasAppsReachedLimit = useMemo(
    () =>
      isDevFeaturesEnabled
        ? hasReachedSubscriptionQuotaLimit({
            quotaKey: 'applicationsLimit',
            usage: currentSubscriptionUsage.applicationsLimit,
            quota: currentSubscriptionQuota,
          })
        : hasReachedQuotaLimit({
            quotaKey: 'applicationsLimit',
            plan: currentPlan,
            usage: allApplications?.length ?? 0,
          }),
    [
      allApplications?.length,
      currentPlan,
      currentSubscriptionUsage.applicationsLimit,
      currentSubscriptionQuota,
    ]
  );

  return {
    hasMachineToMachineAppsReachedLimit,
    hasMachineToMachineAppsSurpassedLimit,
    hasAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
  };
};

export default useApplicationsUsage;
