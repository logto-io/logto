import { useEffect, useState } from 'react';

import { isDevFeaturesEnabled } from '@/constants/env';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';

const useTrustedDeviceOptIn = (isEnabled = true) => {
  const flowState = useMfaFlowState();
  const availability = isDevFeaturesEnabled && isEnabled ? flowState?.trustedDevice : undefined;
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(false);
  }, [availability?.canCreate, availability?.durationDays]);

  const isVisible = Boolean(availability?.canCreate && availability.durationDays);

  return {
    availability,
    isLoading: false,
    isVisible,
    isChecked,
    setIsChecked,
  };
};

export default useTrustedDeviceOptIn;
