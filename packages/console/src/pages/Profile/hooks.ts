import { useCallback } from 'react';

import { adminTenantEndpoint } from '@/consts';

export const useNavigateToAccountCenter = () => {
  return useCallback((path: string) => {
    const currentProfileUrl = `${window.location.origin}${window.location.pathname}`;
    const accountUrl = new URL(path, adminTenantEndpoint);
    accountUrl.searchParams.set('redirect', currentProfileUrl);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.location.href = accountUrl.toString();
  }, []);
};
