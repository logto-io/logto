import { adminTenantId, type User } from '@logto/schemas';

const ossOnboardingDataKey = 'ossOnboarding';

export const getInitialOssOnboardingCustomData = ({
  isCloud,
  isDevFeaturesEnabled,
  currentTenantId,
}: {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  currentTenantId?: string;
}): User['customData'] | undefined => {
  if (isCloud || !isDevFeaturesEnabled || currentTenantId !== adminTenantId) {
    return;
  }

  return {
    [ossOnboardingDataKey]: {
      isOnboardingDone: false,
    },
  };
};
