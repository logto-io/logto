import { useLogto } from '@logto/react';
import type { TenantInfo } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { useHref } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { AppLoadingOffline } from '@/components/AppLoading/Offline';
import { getUserTenantId } from '@/consts/tenants';
import { TenantsContext } from '@/contexts/TenantsProvider';

import Redirect from './Redirect';
import Tenants from './Tenants';

const Protected = () => {
  const api = useCloudApi();
  const { tenants, setTenants } = useContext(TenantsContext);

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
    const currentTenantId = getUserTenantId();

    if (currentTenantId) {
      return <Redirect tenants={tenants} toTenantId={currentTenantId} />;
    }

    return <Tenants data={tenants} />;
  }

  return <AppLoadingOffline />;
};

const Main = () => {
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const href = useHref(getUserTenantId() + '/callback');

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
