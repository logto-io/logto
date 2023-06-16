import { type TenantInfo, TenantTag } from '@logto/schemas/models';
import { useCallback, useContext, useEffect } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';

import * as styles from './index.module.scss';

type Props = {
  data: TenantInfo[];
  onAdd: (tenant: TenantInfo) => void;
};

function Tenants({ data, onAdd }: Props) {
  const api = useCloudApi();
  const { navigate } = useContext(TenantsContext);

  const createTenant = useCallback(async () => {
    onAdd(
      /**
       * `name` and `tag` are required for POST /tenants API, add fixed value to avoid throwing error.
       * This page page will be removed in upcoming changes on multi-tenancy cloud console.
       */
      await api.post('/api/tenants', { body: { name: 'My Project', tag: TenantTag.Development } })
    );
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
