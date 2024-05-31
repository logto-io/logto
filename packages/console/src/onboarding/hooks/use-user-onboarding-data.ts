import {
  type UserOnboardingData,
  userOnboardingDataGuard,
  userOnboardingDataKey,
} from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

import { isCloud } from '@/consts/env';
import useCurrentUser from '@/hooks/use-current-user';

const useUserOnboardingData = (): {
  data: UserOnboardingData;
  error: unknown;
  isLoading: boolean;
  isLoaded: boolean;
  isOnboarding: boolean;
  update: (data: Partial<UserOnboardingData>) => Promise<void>;
} => {
  const { customData, error, isLoading, isLoaded, updateCustomData } = useCurrentUser();

  const userOnboardingData = useMemo(() => {
    const parsed = z
      .object({ [userOnboardingDataKey]: userOnboardingDataGuard })
      .safeParse(customData);

    return parsed.success ? parsed.data[userOnboardingDataKey] : {};
  }, [customData]);

  const isOnboarding = useMemo(() => {
    if (!isCloud) {
      return false;
    }

    return !userOnboardingData.isOnboardingDone;
  }, [userOnboardingData.isOnboardingDone]);

  const update = useCallback(
    async (data: Partial<UserOnboardingData>) => {
      await updateCustomData({
        [userOnboardingDataKey]: {
          ...userOnboardingData,
          ...data,
        },
      });
    },
    [updateCustomData, userOnboardingData]
  );

  return {
    data: userOnboardingData,
    error,
    isLoading,
    isLoaded,
    isOnboarding,
    update,
  };
};

export default useUserOnboardingData;
