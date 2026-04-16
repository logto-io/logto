import { CompanySize, Project } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

import { isCloud } from '@/consts/env';

import useCurrentUser from './use-current-user';

const ossUserOnboardingDataKey = 'ossOnboarding';

const ossQuestionnaireGuard = z.object({
  emailAddress: z.string().optional(),
  newsletter: z.boolean().optional(),
  project: z.nativeEnum(Project).optional(),
  companyName: z.string().optional(),
  companySize: z.nativeEnum(CompanySize).optional(),
});

const ossUserOnboardingDataGuard = z.object({
  questionnaire: ossQuestionnaireGuard.optional(),
  isOnboardingDone: z.boolean().optional(),
});

type OssUserOnboardingData = z.infer<typeof ossUserOnboardingDataGuard>;

const useOssOnboardingData = (): {
  data: OssUserOnboardingData;
  error: unknown;
  hasOssOnboardingRecord: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  isOnboardingDone: boolean;
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
      // Note: OSS onboarding submissions currently live in user custom data only.
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
    isOnboardingDone: isCloud || Boolean(ossOnboardingData?.isOnboardingDone),
    isOnboardingRequired,
    update,
  };
};

export default useOssOnboardingData;
