import {
  ossUserOnboardingDataGuard,
  ossUserOnboardingDataKey,
  type OssUserOnboardingData,
} from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { useCallback, useMemo } from 'react';

import { isCloud } from '@/consts/env';

import useCurrentUser from './use-current-user';

const useOssOnboardingData = (): {
  data: OssUserOnboardingData;
  error: unknown;
  hasOssOnboardingRecord: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  isOnboardingRequired: boolean;
  update: (data: Partial<OssUserOnboardingData>) => Promise<void>;
} => {
  const { customData, error, isLoading, isLoaded, updateCustomData } = useCurrentUser();

  const ossOnboardingData = useMemo<Optional<OssUserOnboardingData>>(() => {
    const rawOssOnboardingData = customData?.[ossUserOnboardingDataKey];
    const parsed = ossUserOnboardingDataGuard.safeParse(rawOssOnboardingData);

    return parsed.success ? parsed.data : undefined;
  }, [customData]);
  const hasOssOnboardingRecord = Boolean(ossOnboardingData);
  const isOnboardingRequired =
    !isCloud && hasOssOnboardingRecord && !ossOnboardingData?.isOnboardingDone;

  const update = useCallback(
    async (data: Partial<OssUserOnboardingData>) => {
      // TODO: OSS onboarding submissions currently live in user custom data only.
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
    data: ossOnboardingData ?? {},
    error,
    hasOssOnboardingRecord,
    isLoading,
    isLoaded,
    isOnboardingRequired,
    update,
  };
};

export default useOssOnboardingData;
