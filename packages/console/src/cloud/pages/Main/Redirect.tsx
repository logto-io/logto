import { useContext, useEffect } from 'react';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';

function Redirect() {
  const { navigateTenant, tenants, currentTenant } = useContext(TenantsContext);

  useEffect(() => {
    if (!currentTenant) {
      /** Fallback to another available tenant instead of showing `Forbidden`. */
      navigateTenant(tenants[0]?.id ?? '');
    }
  }, [navigateTenant, currentTenant, tenants]);

  return <AppLoading />;
}

export default Redirect;
