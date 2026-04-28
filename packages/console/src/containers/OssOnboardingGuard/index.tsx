import { useParams, Navigate, Outlet, useLocation } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import useOssOnboardingData from '@/hooks/use-oss-onboarding-data';

import { getOssOnboardingRedirectPath } from './utils';

function OssOnboardingGuard() {
  const { tenantId } = useParams();
  const { pathname } = useLocation();
  const { error, isLoading, isOnboardingDone } = useOssOnboardingData();

  if (isLoading) {
    return <AppLoading />;
  }

  const redirectPath = tenantId
    ? getOssOnboardingRedirectPath({
        isCloud,
        isDevFeaturesEnabled,
        hasError: Boolean(error),
        isLoading,
        isOnboardingDone,
        tenantId,
        pathname,
      })
    : undefined;

  if (redirectPath) {
    return <Navigate replace to={redirectPath} />;
  }

  return <Outlet />;
}

export default OssOnboardingGuard;
