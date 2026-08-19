import { MfaFactor } from '@logto/schemas';
import { useEffect, useState } from 'react';

import { getInteraction } from '@/apis/experience';
import { isDevFeaturesEnabled } from '@/constants/env';

const eligibleFactors = Object.freeze([
  MfaFactor.TOTP,
  MfaFactor.WebAuthn,
  MfaFactor.EmailVerificationCode,
  MfaFactor.PhoneVerificationCode,
]);

export const isTrustedDeviceOptInEligible = (factor: MfaFactor) => eligibleFactors.includes(factor);

const useTrustedDeviceOptIn = (factor: MfaFactor) => {
  const [durationDays, setDurationDays] = useState<number>();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setDurationDays(undefined);
    setIsChecked(false);

    // Trusted-device opt-in stays isolated from released Experience flows until launch.
    if (!isDevFeaturesEnabled || !isTrustedDeviceOptInEligible(factor)) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const { trustedDevice } = await getInteraction();
        if (!controller.signal.aborted) {
          setDurationDays(
            trustedDevice?.canCreate && trustedDevice.durationDays
              ? trustedDevice.durationDays
              : undefined
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setDurationDays(undefined);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [factor]);

  return {
    durationDays,
    isChecked,
    setIsChecked,
  };
};

export default useTrustedDeviceOptIn;
