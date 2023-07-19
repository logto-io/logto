import { joinPath } from '@silverhand/essentials';
import { useCallback, useMemo } from 'react';
import {
  type NavigateOptions,
  type To,
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

type TenantPathname = {
  /**
   * A function that can be used to match a specific tenant pathname with
   * the current location.
   *
   * @example
   * ```ts
   * // Current location: `/tenant-1/console`
   * const match = useMatchTenantPath();
   * match('/console'); // true
   * match('/tenant-1/console'); // false
   * match('/another-page'); // false
   * ```
   *
   * @param pathname Pathname to match
   * @param exact Whether to match exactly, defaults to `false`
   */
  match: (pathname: string, exact?: boolean) => boolean;
  /** Returns the `to` object with the current tenant ID prepended. */
  getTo: (to: To) => To;
  /** Navigate to the given pathname in the current tenant. */
  navigate: (to: To, options?: NavigateOptions) => void;
};

/**
 * Returns a `TenantPathname` object that contains utilities for matching
 * and generating tenant-specific pathnames.
 *
 * @see {@link TenantPathname}
 */
function useTenantPathname(): TenantPathname {
  const location = useLocation();
  // TODO: should use TenantsContext instead
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const match = useCallback(
    (pathname: string, exact = false) =>
      matchPath(joinPath(':tenantId', pathname, exact ? '' : '*'), location.pathname) !== null,
    [location.pathname]
  );

  /** Returns the pathname with the current tenant ID prepended. */
  const getPathname = useCallback(
    (pathname: string) => {
      if (pathname.startsWith('/')) {
        return joinPath(tenantId ?? '', pathname);
      }
      // Directly return the pathname if it's a relative pathname
      return pathname;
    },
    [tenantId]
  );

  const getTo = useCallback(
    (to: To) => {
      if (typeof to === 'string') {
        return getPathname(to);
      }
      return { ...to, pathname: getPathname(to.pathname ?? '') };
    },
    [getPathname]
  );

  const data = useMemo(
    () => ({
      match,
      navigate: (to: To, options?: NavigateOptions) => {
        navigate(getTo(to), options);
      },
      getTo,
    }),
    [match, getTo, navigate]
  );
  return data;
}

export default useTenantPathname;
