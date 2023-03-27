import { useLogto } from '@logto/react';
import type { TenantInfo } from '@logto/schemas';
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

import Redirect from './Redirect';
import Tenants from './Tenants';

function Protected() {
  const api = useCloudApi();
  const { tenants, setTenants, currentTenantId } = useContext(TenantsContext);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const loadTenants = async () => {
      setError(undefined);

      try {
        const data = await api.get('/api/tenants').json<TenantInfo[]>();
        setTenants(data);
      } catch (error: unknown) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    if (!tenants) {
      void loadTenants();
    }
  }, [api, setTenants, tenants]);

  if (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      return <SessionExpired error={error} />;
    }

    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  if (tenants) {
    if (currentTenantId) {
      return <Redirect tenants={tenants} toTenantId={currentTenantId} />;
    }

    return (
      <Tenants
        data={tenants}
        onAdd={(tenant) => {
          setTenants([...tenants, tenant]);
        }}
      />
    );
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
