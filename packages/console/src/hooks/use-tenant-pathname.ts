import { ossConsolePath } from '@logto/schemas';
import { appendPath, joinPath } from '@silverhand/essentials';
import { useCallback, useContext, useMemo } from 'react';
import {
  type NavigateOptions,
  type To,
  matchPath,
  useLocation,
  useNavigate,
  useHref,
  type NavigateFunction,
} from 'react-router-dom';

import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

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
  /**
   * Returns the pathname with the current tenant ID prepended if the pathname
   * is an absolute pathname; otherwise, returns the pathname directly.
   */
  getPathname: (pathname: string) => string;
  /**
   * Returns the `to` object with the current tenant ID prepended if the
   * pathname is an absolute pathname; otherwise, returns the `to` object
   * or the string directly.
   */
  getTo: (to: To) => To;
  /** Navigate to the given pathname in the current tenant. */
  navigate: NavigateFunction;
  /** Returns the full URL with the current tenant ID prepended. */
  getUrl: (pathname: string) => URL;
};

/**
 * Returns a `TenantPathname` object that contains utilities for matching
 * and generating tenant-specific pathnames.
 *
 * @see {@link TenantPathname}
 */
function useTenantPathname(): TenantPathname {
  const location = useLocation();
  const { currentTenantId } = useContext(TenantsContext);
  const tenantSegment = useMemo(
    () => (isCloud ? currentTenantId : ossConsolePath.slice(1)),
    [currentTenantId]
  );
  const navigate = useNavigate();
  const href = useHref('/');

  const match = useCallback(
    (pathname: string, exact = false) => {
      // Match relative pathnames directly
      if (!pathname.startsWith('/')) {
        return (
          matchPath(joinPath(location.pathname, pathname, exact ? '' : '*'), location.pathname) !==
          null
        );
      }

      // Match absolute pathnames with the tenant segment
      return (
        matchPath(joinPath(':tenantId', pathname, exact ? '' : '*'), location.pathname) !== null
      );
    },
    [location.pathname]
  );

  /** Returns the pathname with the current tenant ID prepended. */
  const getPathname = useCallback(
    (pathname: string) => {
      if (pathname.startsWith('/') && !pathname.startsWith(`/${tenantSegment}`)) {
        return joinPath(tenantSegment, pathname);
      }
      // Directly return the pathname if it's a relative pathname
      return pathname;
    },
    [tenantSegment]
  );

  const getTo = useCallback(
    (to: To): To => {
      if (typeof to === 'string') {
        return getPathname(to);
      }
      return { ...to, pathname: getPathname(to.pathname ?? '') };
    },
    [getPathname]
  );

  const getUrl = useCallback(
    (pathname = '/') => appendPath(new URL(window.location.origin), href, tenantSegment, pathname),
    [href, tenantSegment]
  );

  const data = useMemo(
    () => ({
      match,
      navigate: (to: To | number, options?: NavigateOptions) => {
        // Navigate to the given index in the history stack
        if (typeof to === 'number') {
          navigate(to);
          return;
        }

        navigate(getTo(to), options);
      },
      getPathname,
      getTo,
      getUrl,
    }),
    [match, getPathname, getTo, navigate, getUrl]
  );
  return data;
}

export default useTenantPathname;
