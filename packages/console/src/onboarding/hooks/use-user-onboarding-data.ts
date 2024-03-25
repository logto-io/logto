import {
  adminTenantId,
  Project,
  type UserOnboardingData,
  userOnboardingDataGuard,
  userOnboardingDataKey,
} from '@logto/schemas';
import { useCallback, useContext, useMemo } from 'react';
import { z } from 'zod';

import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useCurrentUser from '@/hooks/use-current-user';

const useUserOnboardingData = (): {
  data: UserOnboardingData;
  error: unknown;
  isLoading: boolean;
  isLoaded: boolean;
  isOnboarding: boolean;
  isBusinessPlan: boolean;
  update: (data: Partial<UserOnboardingData>) => Promise<void>;
} => {
  const { customData, error, isLoading, isLoaded, updateCustomData } = useCurrentUser();
  const { currentTenantId } = useContext(TenantsContext);

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

    if (currentTenantId === adminTenantId) {
      return false;
    }

    return !userOnboardingData.isOnboardingDone;
  }, [currentTenantId, userOnboardingData.isOnboardingDone]);

  const isBusinessPlan = useMemo(() => {
    if (!isCloud) {
      return false;
    }

    if (currentTenantId === adminTenantId) {
      return true;
    }

    return userOnboardingData.questionnaire?.project === Project.Company;
  }, [currentTenantId, userOnboardingData.questionnaire?.project]);

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
    isBusinessPlan,
    update,
  };
};

export default useUserOnboardingData;
