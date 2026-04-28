import {
  type OssUserOnboardingData,
  ossUserOnboardingDataGuard,
  ossUserOnboardingDataKey,
} from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

import { isCloud } from '@/consts/env';

import useCurrentUser from './use-current-user';

const useOssOnboardingData = (): {
  data: OssUserOnboardingData;
  error: unknown;
  isLoading: boolean;
  isLoaded: boolean;
  isOnboardingDone: boolean;
  update: (data: Partial<OssUserOnboardingData>) => Promise<void>;
} => {
  const { customData, error, isLoading, isLoaded, updateCustomData } = useCurrentUser();

  const ossOnboardingData = useMemo(() => {
    const parsed = z
      .object({ [ossUserOnboardingDataKey]: ossUserOnboardingDataGuard })
      .safeParse(customData);

    return parsed.success ? parsed.data[ossUserOnboardingDataKey] : {};
  }, [customData]);

  const update = useCallback(
    async (data: Partial<OssUserOnboardingData>) => {
      await updateCustomData({
        [ossUserOnboardingDataKey]: {
          ...ossOnboardingData,
          ...data,
        },
      });
    },
    [ossOnboardingData, updateCustomData]
  );

  return {
    data: ossOnboardingData,
    error,
    isLoading,
    isLoaded,
    isOnboardingDone: isCloud || Boolean(ossOnboardingData.isOnboardingDone),
    update,
  };
};

export default useOssOnboardingData;
