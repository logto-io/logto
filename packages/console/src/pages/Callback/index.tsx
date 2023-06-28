import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { getUserTenantId } from '@/consts';
import { isInFirstLevelCallback } from '@/utils/url';

function Callback() {
  const navigate = useNavigate();

  useHandleSignInCallback(() => {
    /**
     * The first level callback check is due to the usage of `basename`
     * for tenant-specific routes, e.g., `/:tenantId/applications`.
     * Once we merge all the routes into one router, we can remove this check.
     */
    navigate(isInFirstLevelCallback() ? `/${getUserTenantId()}` : '/', {
      replace: true,
    });
  });

  return <AppLoading />;
}

export default Callback;
