import { useLogto } from '@logto/react';
import { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSWRConfig } from 'swr';

// Used in the docs

import { isCloud } from '@/consts/env';
import { reservedTenantIdWildcard, TenantsContext } from '@/contexts/TenantsProvider';
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
  const { isAuthenticated } = useLogto();
  const { currentTenant, currentTenantId } = useContext(TenantsContext);
  const { mutate } = useSWRConfig();
  const { pathname } = useLocation();
  const { defaultTenantId } = useUserDefaultTenantId();
  const [isCacheCleared, setIsCacheCleared] = useState(false);

  // Clean the cache when the current tenant ID changes. This is required because the
  // SWR cache key is not tenant-aware.
  useEffect(() => {
    (async () => {
      /**
       * The official cache clean method, see {@link https://github.com/vercel/swr/issues/1887#issuecomment-1171269211 | this comment}.
       *
       * Exceptions:
       * - Exclude the `me` key because it's not tenant-aware. If don't, we need to manually
       * revalidate the `me` key to make console work again.
       * - Exclude keys that include `/.well-known/` because they are usually static and
       * should not be revalidated.
       */
      await mutate(
        (key) => typeof key !== 'string' || (key !== 'me' && !key.includes('/.well-known/')),
        undefined,
        { rollbackOnError: false, throwOnError: false }
      );
      setIsCacheCleared(true);
    })();
  }, [mutate, currentTenantId]);

  useEffect(() => {
    if (
      isAuthenticated &&
      currentTenantId &&
      // The current tenant is unavailable to the user, maybe a deleted tenant or a tenant that
      // the user has no access to.
      // If the current tenant ID equals the reserved wildcard "to", replace it with the last
      // visited tenant ID and keeping the rest of the URL path, otherwise redirect to home page.
      !currentTenant
    ) {
      if (isCloud && defaultTenantId && currentTenantId === reservedTenantIdWildcard) {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        window.location.href = pathname.replace(reservedTenantIdWildcard, defaultTenantId);
        return;
      }

      // eslint-disable-next-line @silverhand/fp/no-mutation
      window.location.href = '/';
    }
  }, [currentTenant, currentTenantId, isAuthenticated, pathname, defaultTenantId]);

  if (!isCacheCleared) {
    return null;
  }

  return <Outlet />;
}
