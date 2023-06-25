import { useLogto } from '@logto/react';
import { type TenantInfo } from '@logto/schemas/lib/models/tenants.js';
import { trySafe } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { getCallbackUrl } from '@/consts';
// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import type ProtectedRoutes from '@/containers/ProtectedRoutes';
import { TenantsContext } from '@/contexts/TenantsProvider';

/**
 * The container that ensures the user has access to the current tenant. When the user is
 * authenticated, it will run the validation by fetching an Access Token for the current
 * tenant.
 *
 * Before the validation is complete, it renders `<AppLoading />`; after the validation is
 * complete:
 *
 * - If the user has access to the current tenant, it renders `<Outlet />`.
 * - If the tenant is unavailable to the user, it redirects to the home page.
 * - If the tenant is available to the user but getAccessToken() fails, it redirects to the
 *   sign-in page to fetch a full-scoped token.
 *
 * Usually this component is used as a child of `<ProtectedRoutes />`, since it requires the
 * user to be authenticated and the tenant to be initialized.
 *
 * Usage:
 *
 * ```tsx
 * <Route element={<ProtectedRoutes />}>
 *   <Route element={<TenantAccess />}>
 *     <Route path="some-path" element={<SomeContent />} />
 *   </Route>
 * </Route>
 * ```
 *
 * Note that the `TenantAccess` component should be put in a {@link https://reactrouter.com/en/main/start/concepts#pathless-routes | pathless route}.
 *
 * @see ProtectedRoutes
 */
export default function TenantAccess() {
  const { getAccessToken, signIn, isAuthenticated } = useLogto();
  const { currentTenant, currentTenantId, currentTenantStatus, setCurrentTenantStatus } =
    useContext(TenantsContext);

  useEffect(() => {
    const validate = async ({ indicator, id }: TenantInfo) => {
      // Test fetching an access token for the current Tenant ID.
      // If failed, it means the user finishes the first auth, ands still needs to auth again to
      // fetch the full-scoped (with all available tenants) token.
      if (await trySafe(getAccessToken(indicator))) {
        setCurrentTenantStatus('validated');
      } else {
        void signIn(getCallbackUrl(id).href);
      }
    };

    if (isAuthenticated && currentTenantId && currentTenantStatus === 'pending') {
      setCurrentTenantStatus('validating');
      if (currentTenant) {
        void validate(currentTenant);
      } else {
        // The current tenant is unavailable to the user, maybe a deleted tenant or a tenant that
        // the user has no access to. Fall back to the home page.
        // eslint-disable-next-line @silverhand/fp/no-mutation
        window.location.href = '/';
      }
    }
  }, [
    currentTenant,
    currentTenantId,
    currentTenantStatus,
    getAccessToken,
    isAuthenticated,
    setCurrentTenantStatus,
    signIn,
  ]);

  return currentTenantStatus === 'validated' ? <Outlet /> : <AppLoading />;
}
