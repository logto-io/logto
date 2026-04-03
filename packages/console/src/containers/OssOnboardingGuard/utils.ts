type GetOssOnboardingRedirectPathOptions = {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  isLoading: boolean;
  isOnboardingDone: boolean;
  tenantId: string;
  pathname: string;
};

const onboardingPath = 'onboarding';

export const getOssOnboardingRedirectPath = ({
  isCloud,
  isDevFeaturesEnabled,
  isLoading,
  isOnboardingDone,
  tenantId,
  pathname,
}: GetOssOnboardingRedirectPathOptions): string | undefined => {
  if (
    isCloud ||
    !isDevFeaturesEnabled ||
    isLoading ||
    isOnboardingDone ||
    pathname.endsWith(`/${onboardingPath}`)
  ) {
    return;
  }

  return `/${tenantId}/${onboardingPath}`;
};
