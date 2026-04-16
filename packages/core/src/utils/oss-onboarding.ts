import { adminTenantId, ossUserOnboardingDataKey, type User } from '@logto/schemas';

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
    [ossUserOnboardingDataKey]: {
      isOnboardingDone: false,
    },
  };
};
