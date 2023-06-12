import { useLogto } from '@logto/react';
import { conditional, yes } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import { useContext, useEffect, useState } from 'react';
import { useHref, useSearchParams } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppError from '@/components/AppError';
import AppLoading from '@/components/AppLoading';
import SessionExpired from '@/components/SessionExpired';
import { searchKeys } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';

import Redirect from './Redirect';
import TenantLandingPage from './TenantLandingPage';

function Protected() {
  const api = useCloudApi();
  const { tenants, setTenants, currentTenantId, navigate } = useContext(TenantsContext);
  const { isOnboarding, isLoaded } = useUserOnboardingData();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const loadTenants = async () => {
      setError(undefined);

      try {
        const data = await api.get('/api/tenants');
        setTenants(data);
      } catch (error: unknown) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    if (!tenants) {
      void loadTenants();
    }
  }, [api, setTenants, tenants]);

  useEffect(() => {
    const createFirstTenant = async () => {
      setError(undefined);

      try {
        const newTenant = await api.post('/api/tenants', { body: {} }); // Use DB default value.
        setTenants([newTenant]);
        navigate(newTenant.id);
      } catch (error: unknown) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    if (isLoaded && isOnboarding && tenants?.length === 0) {
      void createFirstTenant();
    }
  }, [api, isOnboarding, isLoaded, setTenants, tenants, navigate]);

  if (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      return <SessionExpired error={error} />;
    }

    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  if (tenants) {
    /**
     * Redirect to the first tenant if the current tenant ID is not set or can not be found.
     *
     * `currentTenantId` can be empty string, so that Boolean is required and `??` is
     * not applicable for current case.
     */

    // eslint-disable-next-line no-extra-boolean-cast
    const toTenantId = Boolean(currentTenantId) ? currentTenantId : tenants[0]?.id;
    if (toTenantId) {
      return <Redirect tenants={tenants} toTenantId={toTenantId} />;
    }

    /**
     * Will create a new tenant for new users that need go through onboarding process,
     * but create tenant takes time, the screen will have a glance of landing page of empty tenant.
     */
    if (isLoaded && !isOnboarding) {
      return <TenantLandingPage />;
    }
  }

  return <AppLoading />;
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

  return <Protected />;
}

export default Main;
