import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { getUserTenantId } from '@/consts';
import { consumeSavedRedirect } from '@/utils/storage';
import { isInFirstLevelCallback } from '@/utils/url';

/** The global callback page for all sign-in redirects from Logto main flow. */
function Callback() {
  const navigate = useNavigate();

  useHandleSignInCallback(() => {
    const saved = consumeSavedRedirect();

    if (saved) {
      const { pathname, ...rest } = saved;
      // Remove the first two path segments since we are using `basename` for tenant-specific
      // routes (the first segment is empty because of the leading slash).
      // For example, `/:tenantId/applications` will be `/applications` after removing.
      // Once we merge all the routes into one router, we can remove this implementation.
      const [_, __, ...segments] = pathname?.split('/') ?? [];
      navigate({ ...rest, pathname: '/' + segments.join('/') });
      return;
    }

    /**
     * The first level callback check is due to the usage of `basename`
     * for tenant-specific routes, e.g., `/:tenantId/applications`.
     * Once we merge all the routes into one router, we can remove this check.
     */
    const defaultTo = isInFirstLevelCallback() ? `/${getUserTenantId()}` : '/';

    navigate(defaultTo, { replace: true });
  });

  return <AppLoading />;
}

export default Callback;
