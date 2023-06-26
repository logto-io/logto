import { useContext, useEffect } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';

export default function AutoCreateTenant() {
  const api = useCloudApi();
  const { prependTenant, tenants } = useContext(TenantsContext);

  useEffect(() => {
    const createTenant = async () => {
      const newTenant = await api.post('/api/tenants', { body: {} });
      prependTenant(newTenant);
    };

    if (tenants.length === 0) {
      void createTenant();
    }
  }, [api, prependTenant, tenants.length]);

  return <AppLoading />;
}
