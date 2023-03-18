import { adminTenantId } from '@logto/schemas';
import { useCallback, useContext, useMemo } from 'react';
import { z } from 'zod';

import { isCloud } from '@/consts/cloud';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useMeCustomData from '@/hooks/use-me-custom-data';

import type { UserOnboardingData } from '../types';
import { Project, userOnboardingDataGuard } from '../types';

const userOnboardingDataKey = 'onboarding';

const useUserOnboardingData = () => {
  const { data, error, isLoading, isLoaded, update: updateMeCustomData } = useMeCustomData();
  const { currentTenantId } = useContext(TenantsContext);

  const userOnboardingData = useMemo(() => {
    const parsed = z.object({ [userOnboardingDataKey]: userOnboardingDataGuard }).safeParse(data);

    return parsed.success ? parsed.data[userOnboardingDataKey] : {};
  }, [data]);

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
      await updateMeCustomData({
        [userOnboardingDataKey]: {
          ...userOnboardingData,
          ...data,
        },
      });
    },
    [updateMeCustomData, userOnboardingData]
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
