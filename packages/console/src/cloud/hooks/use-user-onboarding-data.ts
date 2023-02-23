import { useCallback, useMemo } from 'react';
import { z } from 'zod';

import useMeCustomData from '@/hooks/use-me-custom-data';

import type { UserOnboardingData } from '../types';
import { userOnboardingDataGuard } from '../types';

const userOnboardingDataKey = 'onboarding';

const useUserOnboardingData = () => {
  const { data, error, isLoading, isLoaded, update: updateMeCustomData } = useMeCustomData();

  const userOnboardingData = useMemo(() => {
    const parsed = z.object({ [userOnboardingDataKey]: userOnboardingDataGuard }).safeParse(data);

    return parsed.success ? parsed.data[userOnboardingDataKey] : {};
  }, [data]);

  const update = useCallback(
    async (data: Partial<UserOnboardingData>) => {
      await updateMeCustomData({
        [userOnboardingDataKey]: {
          ...userOnboardingData,
          ...data,
        },
      });
    },
    [updateMeCustomData, userOnboardingData]
  );

  return { data: userOnboardingData, error, isLoading, isLoaded, update };
};

export default useUserOnboardingData;
