type GetOssOnboardingRedirectPathOptions = {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  isProduction: boolean;
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
  isProduction,
  hasError,
  isLoading,
  isOnboardingDone,
  tenantId,
  pathname,
}: GetOssOnboardingRedirectPathOptions): string | undefined => {
  if (
    isCloud ||
    !isDevFeaturesEnabled ||
    !isProduction ||
    hasError ||
    isLoading ||
    isOnboardingDone ||
    pathname.endsWith(`/${onboardingPath}`)
  ) {
    return;
  }

  return `/${tenantId}/${onboardingPath}`;
};
