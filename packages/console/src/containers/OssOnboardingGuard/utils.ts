type GetOssOnboardingRedirectPathOptions = {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  hasError: boolean;
  isLoading: boolean;
  isOnboardingDone: boolean;
  tenantId: string;
  pathname: string;
};

const onboardingPath = 'onboarding';

export const getOssOnboardingRedirectPath = ({
  isCloud,
  isDevFeaturesEnabled,
  hasError,
  isLoading,
  isOnboardingDone,
  tenantId,
  pathname,
}: GetOssOnboardingRedirectPathOptions): string | undefined => {
  if (
    isCloud ||
    !isDevFeaturesEnabled ||
    hasError ||
    isLoading ||
    isOnboardingDone ||
    pathname.endsWith(`/${onboardingPath}`)
  ) {
    return;
  }

  return `/${tenantId}/${onboardingPath}`;
};
