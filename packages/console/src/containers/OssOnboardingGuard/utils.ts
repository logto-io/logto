type GetOssOnboardingRedirectPathOptions = {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  hasError: boolean;
  isLoading: boolean;
  isOnboardingRequired: boolean;
  tenantId: string;
  pathname: string;
};

const onboardingPath = 'onboarding';

export const getOssOnboardingRedirectPath = ({
  isCloud,
  isDevFeaturesEnabled,
  hasError,
  isLoading,
  isOnboardingRequired,
  tenantId,
  pathname,
}: GetOssOnboardingRedirectPathOptions): string | undefined => {
  if (
    isCloud ||
    !isDevFeaturesEnabled ||
    hasError ||
    isLoading ||
    !isOnboardingRequired ||
    pathname.endsWith(`/${onboardingPath}`)
  ) {
    return;
  }

  return `/${tenantId}/${onboardingPath}`;
};
