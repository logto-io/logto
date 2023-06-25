import { useLogto } from '@logto/react';
import { yes, conditional } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { searchKeys, getCallbackUrl } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';

/**
 * The container for all protected routes. It renders `<AppLoading />` when the user is not
 * authenticated or the user is authenticated but the tenant is not initialized.
 *
 * That is, when it renders `<Outlet />`, you can expect:
 *
 * - `isAuthenticated` from `useLogto()` to be `true`.
 * - `isInitComplete` from `TenantsContext` to be `true`.
 *
 * Usage:
 *
 * ```tsx
 * <Route element={<ProtectedRoutes />}>
 *  <Route path="some-path" element={<SomeContent />} />
 * </Route>
 * ```
 *
 * Note that the `ProtectedRoutes` component should be put in a {@link https://reactrouter.com/en/main/start/concepts#pathless-routes | pathless route}.
 */
export default function ProtectedRoutes() {
  const api = useCloudApi();
  const [searchParameters] = useSearchParams();
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const { currentTenantId, isInitComplete, resetTenants } = useContext(TenantsContext);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const isSignUpMode = yes(searchParameters.get(searchKeys.signUp));
      void signIn(getCallbackUrl(currentTenantId).href, conditional(isSignUpMode && 'signUp'));
    }
  }, [currentTenantId, isAuthenticated, isLoading, searchParameters, signIn]);

  useEffect(() => {
    if (isAuthenticated && !isInitComplete) {
      const loadTenants = async () => {
        const data = await api.get('/api/tenants');
        resetTenants(data);
      };

      void loadTenants();
    }
  }, [api, isAuthenticated, isInitComplete, resetTenants]);

  if (!isInitComplete || !isAuthenticated) {
    return <AppLoading />;
  }

  return <Outlet />;
}
