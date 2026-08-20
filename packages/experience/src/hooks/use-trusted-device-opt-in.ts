import { useEffect, useState } from 'react';

import { getInteraction, type TrustedDeviceAvailability } from '@/apis/experience';
import { isDevFeaturesEnabled } from '@/constants/env';
import useApi from '@/hooks/use-api';

const useTrustedDeviceOptIn = (shouldFetch = true) => {
  const canFetch = isDevFeaturesEnabled && shouldFetch;
  const [availability, setAvailability] = useState<TrustedDeviceAvailability>();
  const [isLoading, setIsLoading] = useState(canFetch);
  const [isChecked, setIsChecked] = useState(false);
  const request = useApi(getInteraction, { silent: true });

  useEffect(() => {
    setAvailability(undefined);
    setIsLoading(canFetch);
    setIsChecked(false);

    // Trusted-device opt-in stays isolated from released Experience flows until launch.
    if (!canFetch) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      const [, result] = await request(controller.signal);

      if (!controller.signal.aborted) {
        setAvailability(result?.trustedDevice);
        setIsLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [canFetch, request]);

  const isVisible = Boolean(availability?.canCreate && availability.durationDays);

  return {
    availability,
    isLoading,
    isVisible,
    isChecked,
    setIsChecked,
  };
};

export default useTrustedDeviceOptIn;
