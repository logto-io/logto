import { type Application, ApplicationType } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { hasReachedQuotaLimit, hasSurpassedQuotaLimit } from '@/utils/quota';

const useApplicationsUsage = () => {
  const { currentPlan } = useContext(SubscriptionDataContext);

  /**
   * Note: we only need to fetch all applications when the user is in cloud environment.
   * The oss version doesn't have the quota limit.
   */
  const { data: allApplications } = useSWR<Application[]>(isCloud && 'api/applications');

  const m2mAppCount = useMemo(
    () =>
      allApplications?.filter(({ type }) => type === ApplicationType.MachineToMachine).length ?? 0,
    [allApplications]
  );

  const thirdPartyAppCount = useMemo(
    () => allApplications?.filter(({ isThirdParty }) => isThirdParty).length ?? 0,
    [allApplications]
  );

  const hasMachineToMachineAppsReachedLimit = useMemo(
    () =>
      hasReachedQuotaLimit({
        quotaKey: 'machineToMachineLimit',
        plan: currentPlan,
        usage: m2mAppCount,
      }),
    [currentPlan, m2mAppCount]
  );

  const hasMachineToMachineAppsSurpassedLimit = useMemo(
    () =>
      hasSurpassedQuotaLimit({
        quotaKey: 'machineToMachineLimit',
        plan: currentPlan,
        usage: m2mAppCount,
      }),
    [currentPlan, m2mAppCount]
  );

  const hasThirdPartyAppsReachedLimit = useMemo(
    () =>
      hasReachedQuotaLimit({
        quotaKey: 'thirdPartyApplicationsLimit',
        plan: currentPlan,
        usage: thirdPartyAppCount,
      }),
    [currentPlan, thirdPartyAppCount]
  );

  const hasAppsReachedLimit = useMemo(
    () =>
      hasReachedQuotaLimit({
        quotaKey: 'applicationsLimit',
        plan: currentPlan,
        usage: allApplications?.length ?? 0,
      }),
    [allApplications?.length, currentPlan]
  );

  return {
    hasMachineToMachineAppsReachedLimit,
    hasMachineToMachineAppsSurpassedLimit,
    hasAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
  };
};

export default useApplicationsUsage;
