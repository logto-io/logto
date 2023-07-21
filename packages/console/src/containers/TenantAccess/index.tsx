import { useLogto } from '@logto/react';
import { type TenantInfo } from '@logto/schemas/lib/models/tenants.js';
import { trySafe } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import AppLoading from '@/components/AppLoading';
// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import type ProtectedRoutes from '@/containers/ProtectedRoutes';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useUserDefaultTenantId from '@/hooks/use-user-default-tenant-id';

/**
 * The container that ensures the user has access to the current tenant. When the user is
 * authenticated, it will run the validation by fetching an Access Token for the current
 * tenant.
 *
 * Before the validation is complete, it renders `<AppLoading />`; after the validation is
 * complete:
 *
 * - If the user has access to the current tenant, it renders `<Outlet />` and sets the
 * user's default tenant ID to the current tenant ID.
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
  const { updateIfNeeded } = useUserDefaultTenantId();
  const { mutate } = useSWRConfig();

  // Clean the cache when the current tenant ID changes. This is required because the
  // SWR cache key is not tenant-aware.
  useEffect(() => {
    /**
     * The official cache clean method, see {@link https://github.com/vercel/swr/issues/1887#issuecomment-1171269211 | this comment}.
     *
     * We need to exclude the `me` key because it's not tenant-aware. If don't, we
     * need to manually revalidate the `me` key to make console work again.
     */
    void mutate((key) => key !== 'me', undefined, false);
  }, [mutate, currentTenantId]);

  useEffect(() => {
    const validate = async ({ indicator }: TenantInfo) => {
      // Test fetching an access token for the current Tenant ID.
      // If failed, it means the user finishes the first auth, ands still needs to auth again to
      // fetch the full-scoped (with all available tenants) token.
      if (await trySafe(getAccessToken(indicator))) {
        setCurrentTenantStatus('validated');
      }
      // If failed, it will be treated as a session expired error, and will be handled by the
      // upper `<ErrorBoundary />`.
    };

    if (isAuthenticated && currentTenantId && currentTenantStatus === 'pending') {
      setCurrentTenantStatus('validating');

      // The current tenant is unavailable to the user, maybe a deleted tenant or a tenant that
      // the user has no access to. Fall back to the home page.
      if (!currentTenant) {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        window.location.href = '/';
        return;
      }

      void validate(currentTenant);
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

  // Update the user's default tenant ID if the current tenant is validated.
  useEffect(() => {
    if (currentTenantStatus === 'validated') {
      void updateIfNeeded();
    }
  }, [currentTenantStatus, updateIfNeeded]);

  return currentTenantStatus === 'validated' ? <Outlet /> : <AppLoading />;
}
