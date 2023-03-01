import { useLogto } from '@logto/react';
import type { TenantInfo } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { useHref } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { AppLoadingOffline } from '@/components/AppLoading/Offline';
import { TenantsContext } from '@/contexts/TenantsProvider';

import Redirect from './Redirect';
import Tenants from './Tenants';

const Protected = () => {
  const api = useCloudApi();
  const { tenants, setTenants, currentTenantId } = useContext(TenantsContext);

  useEffect(() => {
    const loadTenants = async () => {
      const data = await api.get('/api/tenants').json<TenantInfo[]>();
      setTenants(data);
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

  return <AppLoadingOffline />;
};

const Main = () => {
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const { currentTenantId } = useContext(TenantsContext);
  const href = useHref(currentTenantId + '/callback');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void signIn(new URL(href, window.location.origin).toString());
    }
  }, [href, isAuthenticated, isLoading, signIn]);

  if (!isAuthenticated) {
    return <AppLoadingOffline />;
  }

  return <Protected />;
};

export default Main;
