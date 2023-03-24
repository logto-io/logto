import type { TenantInfo } from '@logto/schemas';
import { useCallback, useContext, useEffect } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import Button from '@/components/Button';
import DangerousRaw from '@/components/DangerousRaw';
import { TenantsContext } from '@/contexts/TenantsProvider';

import * as styles from './index.module.scss';

type Props = {
  data: TenantInfo[];
  onAdd: (tenant: TenantInfo) => void;
};

function Tenants({ data, onAdd }: Props) {
  const api = useCloudApi();
  const { navigate } = useContext(TenantsContext);

  const createTenant = useCallback(async () => {
    onAdd(await api.post('api/tenants').json<TenantInfo>());
  }, [api, onAdd]);

  useEffect(() => {
    if (data.length > 1) {
      return;
    }

    if (data[0]) {
      navigate(data[0].id);
    } else {
      void createTenant();
    }
  }, [createTenant, data, navigate]);

  if (data.length > 1) {
    return (
      <div className={styles.wrapper}>
        <h3>Choose a tenant</h3>
        {data.map(({ id }) => (
          <a
            key={id}
            href={'/' + id}
            onClick={(event) => {
              event.preventDefault();
              navigate(id);
            }}
          >
            <Button title={<DangerousRaw>{id}</DangerousRaw>} />
          </a>
        ))}
        <h3>Create a tenant</h3>
        <Button title={<DangerousRaw>Create</DangerousRaw>} onClick={createTenant} />
      </div>
    );
  }

  return <AppLoading />;
}

export default Tenants;
