import { useContext, useEffect } from 'react';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';

function Redirect({ toTenantId }: { readonly toTenantId: string }) {
  const { navigateTenant } = useContext(TenantsContext);

  useEffect(() => {
    navigateTenant(toTenantId);
  }, [navigateTenant, toTenantId]);

  return <AppLoading />;
}

export default Redirect;
