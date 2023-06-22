import { useLogto } from '@logto/react';
import { conditional, yes } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { useHref, useSearchParams } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { searchKeys } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';

import AutoCreateTenant from './AutoCreateTenant';
import Redirect from './Redirect';
import TenantLandingPage from './TenantLandingPage';

function Content() {
  const api = useCloudApi();
  const { tenants, resetTenants, currentTenantId, isInitComplete } = useContext(TenantsContext);
  const { isOnboarding, isLoaded: isOnboardingDataLoaded } = useUserOnboardingData();

  // Load tenants from the cloud API for the first render.
  useEffect(() => {
    const loadTenants = async () => {
      const data = await api.get('/api/tenants');
      resetTenants(data);
    };

    if (!isInitComplete) {
      void loadTenants();
    }
  }, [api, resetTenants, tenants, isInitComplete]);

  if (!isInitComplete || !isOnboardingDataLoaded) {
    return <AppLoading />;
  }

  /**
   * Trigger a redirect when one of the following conditions is met:
   *
   * - If a current tenant ID has been set in the URL; or
   * - If current tenant ID is not set, but there is at least one tenant available.
   */
  if (currentTenantId || tenants[0]) {
    return <Redirect />;
  }

  // A new user has just signed up and has no tenant, needs to create a new tenant.
  if (isOnboarding) {
    return <AutoCreateTenant />;
  }

  // If user has completed onboarding and still has no tenant, redirect to a special landing page.
  return <TenantLandingPage />;
}

function Main() {
  const [searchParameters] = useSearchParams();
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const { currentTenantId } = useContext(TenantsContext);
  const href = useHref(currentTenantId + '/callback');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const isSignUpMode = yes(searchParameters.get(searchKeys.signUp));
      void signIn(
        new URL(href, window.location.origin).toString(),
        conditional(isSignUpMode && 'signUp')
      );
    }
  }, [href, isAuthenticated, isLoading, searchParameters, signIn]);

  if (!isAuthenticated) {
    return <AppLoading />;
  }

  return <Content />;
}

export default Main;
