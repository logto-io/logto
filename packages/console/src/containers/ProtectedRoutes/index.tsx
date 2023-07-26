import { useLogto } from '@logto/react';
import { type TenantInfo } from '@logto/schemas/lib/models/tenants.js';
import { yes, conditional, trySafe } from '@silverhand/essentials';
import { useCallback, useContext, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { preload } from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { searchKeys, getCallbackUrl } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { saveRedirect } from '@/utils/storage';

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

  const preloadSubscriptionData = useCallback(
    async (tenants: TenantInfo[]) => {
      await Promise.all([
        // Preload subscription plans
        preload('/api/subscription-plans', async () => trySafe(api.get('/api/subscription-plans'))),
        // Preload tenants' subscriptions
        ...tenants.map(async ({ id: tenantId }) =>
          preload(`/api/tenants/${tenantId}/subscription`, async () =>
            trySafe(api.get(`/api/tenants/:tenantId/subscription`, { params: { tenantId } }))
          )
        ),
        // Preload tenants' subscription usages
        ...tenants.map(async ({ id: tenantId }) =>
          preload(`/api/tenants/${tenantId}/usage`, async () =>
            trySafe(api.get(`/api/tenants/:tenantId/usage`, { params: { tenantId } }))
          )
        ),
        // Preload tenants' invoices
        ...tenants.map(async ({ id: tenantId }) =>
          preload(`/api/tenants/${tenantId}/invoices`, async () =>
            trySafe(api.get(`/api/tenants/:tenantId/invoices`, { params: { tenantId } }))
          )
        ),
      ]);
    },
    [api]
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      saveRedirect();
      const isSignUpMode = yes(searchParameters.get(searchKeys.signUp));
      void signIn(getCallbackUrl(currentTenantId).href, conditional(isSignUpMode && 'signUp'));
    }
  }, [currentTenantId, isAuthenticated, isLoading, searchParameters, signIn]);

  useEffect(() => {
    if (isAuthenticated && !isInitComplete) {
      const loadTenants = async () => {
        const data = await api.get('/api/tenants');
        await preloadSubscriptionData(data);
        resetTenants(data);
      };

      void loadTenants();
    }
  }, [api, isAuthenticated, isInitComplete, preloadSubscriptionData, resetTenants]);

  if (!isInitComplete || !isAuthenticated) {
    return <AppLoading />;
  }

  return <Outlet />;
}
