import type { TenantInfo } from '@logto/schemas';
import { useCallback, useEffect } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { AppLoadingOffline } from '@/components/AppLoading/Offline';
import Button from '@/components/Button';
import DangerousRaw from '@/components/DangerousRaw';

import * as styles from './index.module.scss';

type Props = {
  data: TenantInfo[];
  onAdd: (tenant: TenantInfo) => void;
};

const Tenants = ({ data, onAdd }: Props) => {
  const api = useCloudApi();

  const createTenant = useCallback(async () => {
    onAdd(await api.post('api/tenants').json<TenantInfo>());
  }, [api, onAdd]);

  useEffect(() => {
    if (data.length > 1) {
      return;
    }

    if (data[0]) {
      window.location.assign('/' + data[0].id);
    } else {
      void createTenant();
    }
  }, [createTenant, data]);

  if (data.length > 1) {
    return (
      <div className={styles.wrapper}>
        <h3>Choose a tenant</h3>
        {data.map(({ id }) => (
          <a key={id} href={'/' + id}>
            <Button title={<DangerousRaw>{id}</DangerousRaw>} />
          </a>
        ))}
        <h3>Create a tenant</h3>
        <Button title={<DangerousRaw>Create New</DangerousRaw>} onClick={createTenant} />
      </div>
    );
  }

  return <AppLoadingOffline />;
};

export default Tenants;
