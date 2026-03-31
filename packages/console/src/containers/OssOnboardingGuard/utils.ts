type GetOssOnboardingRedirectPathOptions = {
  isCloud: boolean;
  isLoading: boolean;
  isOnboardingDone: boolean;
  tenantId: string;
  pathname: string;
};

const onboardingPath = 'onboarding';

export const getOssOnboardingRedirectPath = ({
  isCloud,
  isLoading,
  isOnboardingDone,
  tenantId,
  pathname,
}: GetOssOnboardingRedirectPathOptions): string | undefined => {
  if (isCloud || isLoading || isOnboardingDone || pathname.endsWith(`/${onboardingPath}`)) {
    return;
  }

  return `/${tenantId}/${onboardingPath}`;
};
