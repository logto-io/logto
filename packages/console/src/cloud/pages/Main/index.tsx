import { useLogto } from '@logto/react';
import type { TenantInfo } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { useCallback, useContext, useEffect } from 'react';
import { useHref, useNavigate } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { getUserTenantId } from '@/consts/tenants';
import { TenantsContext } from '@/contexts/TenantsProvider';

const Main = () => {
  const { isAuthenticated, isLoading, signIn, getAccessToken } = useLogto();
  const api = useCloudApi();
  const {
    tenants: { data, isSettle },
    setTenants,
  } = useContext(TenantsContext);
  const navigate = useNavigate();
  const href = useHref(getUserTenantId() + '/callback');

  const loadTenants = useCallback(async () => {
    const data = await api.get('/api/tenants').json<TenantInfo[]>();
    const currentId = getUserTenantId();
    const current = data.find(({ id }) => id === currentId);

    if (currentId) {
      if (current) {
        // Test fetching an access token for the current Tenant ID.
        // If failed, it means the user finishes the first auth, ands still needs to auth again to
        // fetch the full-scoped (with all available tenants) token.
        if (!(await trySafe(getAccessToken(current.indicator)))) {
          setTenants({ data, isSettle: false });

          return;
        }
      } else {
        // TODO: this tenant id is not in the list, should show an error
        navigate('/', { replace: true });
      }
    }

    setTenants({ data, isSettle: true });
  }, [api, getAccessToken, navigate, setTenants]);

  useEffect(() => {
    if (isAuthenticated && data === undefined) {
      void loadTenants();
    }
  }, [data, isAuthenticated, loadTenants]);

  useEffect(() => {
    if ((!isLoading && !isAuthenticated) || (isAuthenticated && !isSettle)) {
      void signIn(new URL(href, window.location.origin).toString());
    }
  }, [href, isAuthenticated, isLoading, isSettle, signIn]);

  if (data) {
    if (data.length === 0) {
      return <div>no tenant, should automatically create one</div>;
    }

    if (data.length === 1) {
      return <div>single tenant: {data[0]?.id}, should automatically redirect</div>;
    }

    if (data.length > 1) {
      return (
        <div>multiple tenants: {data.map(({ id }) => id).join(', ')}, should let user choose</div>
      );
    }
  }

  return <AppLoading />;
};

export default Main;
