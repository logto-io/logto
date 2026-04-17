import {
  adminTenantId,
  ossUserOnboardingDataKey,
  type User,
  userOnboardingDataKey,
  type UserOnboardingData,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

const getInitialOssOnboardingCustomData = ({
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

export const getInitialUserCustomData = ({
  isCloud,
  isDevFeaturesEnabled,
  currentTenantId,
  hasPendingCloudInvitations,
}: {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  currentTenantId?: string;
  hasPendingCloudInvitations: boolean;
}): User['customData'] | undefined => {
  const customData = {
    ...conditional(
      hasPendingCloudInvitations && {
        [userOnboardingDataKey]: {
          isOnboardingDone: true,
        } satisfies UserOnboardingData,
      }
    ),
    ...getInitialOssOnboardingCustomData({
      isCloud,
      isDevFeaturesEnabled,
      currentTenantId,
    }),
  };

  return Object.keys(customData).length > 0 ? customData : undefined;
};
