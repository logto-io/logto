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

  const hasSamlAppsReachedLimit = hasReachedSubscriptionQuotaLimit('samlApplicationsLimit');

  const hasSamlAppsSurpassedLimit = hasSurpassedSubscriptionQuotaLimit('samlApplicationsLimit');

  return {
    hasMachineToMachineAppsReachedLimit,
    hasMachineToMachineAppsSurpassedLimit,
    hasAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
    hasSamlAppsReachedLimit,
    hasSamlAppsSurpassedLimit,
  };
};

export default useApplicationsUsage;
