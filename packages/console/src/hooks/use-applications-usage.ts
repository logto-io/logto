import { useContext } from 'react';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

const useApplicationsUsage = () => {
  const { hasReachedSubscriptionQuotaLimit, hasSurpassedSubscriptionQuotaLimit } =
    useContext(SubscriptionDataContext);

  const hasMachineToMachineAppsReachedLimit =
    hasReachedSubscriptionQuotaLimit('machineToMachineLimit');

  const hasMachineToMachineAppsSurpassedLimit =
    hasSurpassedSubscriptionQuotaLimit('machineToMachineLimit');

  const hasThirdPartyAppsReachedLimit = hasReachedSubscriptionQuotaLimit(
    'thirdPartyApplicationsLimit'
  );

  const hasAppsReachedLimit = hasReachedSubscriptionQuotaLimit('applicationsLimit');

  return {
    hasMachineToMachineAppsReachedLimit,
    hasMachineToMachineAppsSurpassedLimit,
    hasAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
  };
};

export default useApplicationsUsage;
