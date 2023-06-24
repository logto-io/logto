import { useLogto } from '@logto/react';
import { yes, conditional } from '@silverhand/essentials';
import { useContext, useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { searchKeys, getCallbackUrl } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';

export default function ProtectedRoutes() {
  const api = useCloudApi();
  const [searchParameters] = useSearchParams();
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const { currentTenantId, isInitComplete, resetTenants } = useContext(TenantsContext);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const isSignUpMode = yes(searchParameters.get(searchKeys.signUp));
      void signIn(getCallbackUrl(currentTenantId).href, conditional(isSignUpMode && 'signUp'));
    }
  }, [currentTenantId, isAuthenticated, isLoading, searchParameters, signIn]);

  useEffect(() => {
    if (isAuthenticated && !loadingTenants && !isInitComplete) {
      const loadTenants = async () => {
        const data = await api.get('/api/tenants');
        resetTenants(data);
      };

      setLoadingTenants(true);
      void loadTenants();
    }
  }, [api, isAuthenticated, isInitComplete, loadingTenants, resetTenants]);

  if (isLoading || !isInitComplete) {
    return <AppLoading />;
  }

  return <Outlet />;
}
