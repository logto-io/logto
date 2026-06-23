import { useEffect } from 'react';

import { adminTenantEndpoint } from '@/consts';
import { isCloud } from '@/consts/env';
import useTenantPathname from '@/hooks/use-tenant-pathname';

/**
 * Redirects the current window to the Account Center security page with a `redirect` query
 * parameter pointing back to the Console origin (or the tenant-scoped Console path for OSS).
 */
function RedirectToAccountCenter() {
  const { getUrl } = useTenantPathname();

  useEffect(() => {
    const redirectUrl = isCloud ? window.location.origin : getUrl('/').href;
    const accountUrl = new URL('/account/security', adminTenantEndpoint.href);
    accountUrl.searchParams.set('redirect', redirectUrl);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.location.href = accountUrl.toString();
  }, [getUrl]);

  return null;
}

export default RedirectToAccountCenter;
