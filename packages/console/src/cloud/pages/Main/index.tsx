import { useLogto } from '@logto/react';
import type { TenantInfo } from '@logto/schemas';
import { conditional, yes } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import { useContext, useEffect } from 'react';
import { useHref, useSearchParams } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { searchKeys } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';

import Redirect from './Redirect';
import Tenants from './Tenants';

function Protected() {
  const api = useCloudApi();
  const { tenants, setTenants, currentTenantId } = useContext(TenantsContext);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const data = await api.get('/api/tenants').json<TenantInfo[]>();
        setTenants(data);
      } catch (error: unknown) {
        if (error instanceof HTTPError && error.response.status === 401) {
          throw error;
        }
        throw new Error('Fail to load tenants', { cause: error });
      }
    };

    if (!tenants) {
      void loadTenants();
    }
  }, [api, setTenants, tenants]);

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
