import { useEffect, useState } from 'react';

import { isDevFeaturesEnabled } from '@/constants/env';
import useMfaFlowState from '@/hooks/use-mfa-factors-state';

const useTrustedDeviceOptIn = (isEnabled = true) => {
  const flowState = useMfaFlowState();
  const availability = isDevFeaturesEnabled && isEnabled ? flowState?.trustedDevice : undefined;
  const durationDays = availability?.canCreate ? availability.durationDays : undefined;
  const [isChecked, setIsChecked] = useState(availability?.creationRequested ?? false);

  useEffect(() => {
    setIsChecked(availability?.creationRequested ?? false);
  }, [availability?.creationRequested]);

  return {
    durationDays,
    isChecked,
    setIsChecked,
    createTrustedDevice: durationDays ? isChecked : undefined,
  };
};

export default useTrustedDeviceOptIn;
