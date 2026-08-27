import { useState } from 'react';

import { isDevFeaturesEnabled } from '@/constants/env';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';

const useTrustedDeviceOptIn = (isEnabled = true) => {
  const flowState = useMfaFlowState();
  const availability = isDevFeaturesEnabled && isEnabled ? flowState?.trustedDevice : undefined;
  const durationDays = availability?.canCreate ? availability.durationDays : undefined;
  const [isChecked, setIsChecked] = useState(false);

  return {
    durationDays,
    isChecked,
    setIsChecked,
  };
};

export default useTrustedDeviceOptIn;
