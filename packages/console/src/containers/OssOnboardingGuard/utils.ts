type GetOssOnboardingRedirectPathOptions = {
  isCloud: boolean;
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
  isProduction,
  hasError,
  isLoading,
  isOnboardingDone,
  tenantId,
  pathname,
}: GetOssOnboardingRedirectPathOptions): string | undefined => {
  if (
    isCloud ||
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
