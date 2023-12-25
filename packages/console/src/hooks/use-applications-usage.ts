import { type Application, ApplicationType } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { hasReachedQuotaLimit, hasSurpassedQuotaLimit } from '@/utils/quota';

import useSubscriptionPlan from './use-subscription-plan';

const useApplicationsUsage = () => {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
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

  const hasMachineToMachineAppsReachedLimit = useMemo(
    () =>
      Boolean(
        currentPlan &&
          hasReachedQuotaLimit({
            quotaKey: 'machineToMachineLimit',
            plan: currentPlan,
            usage: m2mAppCount,
          })
      ),
    [currentPlan, m2mAppCount]
  );

  const hasMachineToMachineAppsSurpassedLimit = useMemo(
    () =>
      Boolean(
        currentPlan &&
          hasSurpassedQuotaLimit({
            quotaKey: 'machineToMachineLimit',
            plan: currentPlan,
            usage: m2mAppCount,
          })
      ),
    [currentPlan, m2mAppCount]
  );

  const hasAppsReachedLimit = useMemo(
    () =>
      Boolean(
        currentPlan &&
          hasReachedQuotaLimit({
            quotaKey: 'applicationsLimit',
            plan: currentPlan,
            usage: allApplications?.length ?? 0,
          })
      ),
    [allApplications?.length, currentPlan]
  );

  return {
    hasMachineToMachineAppsReachedLimit,
    hasMachineToMachineAppsSurpassedLimit,
    hasAppsReachedLimit,
  };
};

export default useApplicationsUsage;
