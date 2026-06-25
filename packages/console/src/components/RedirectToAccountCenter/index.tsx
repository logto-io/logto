import { useEffect } from 'react';

import { adminTenantEndpoint } from '@/consts';

/**
 * Redirects the current window to the Account Center profile page.
 */
function RedirectToAccountCenter() {
  useEffect(() => {
    const accountUrl = new URL('/account/profile', adminTenantEndpoint.href);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.location.href = accountUrl.toString();
  }, []);

  return null;
}

export default RedirectToAccountCenter;
