import type { TenantInfo } from '@logto/schemas';
import { useEffect } from 'react';

import { AppLoadingOffline } from '@/components/AppLoading/Offline';
import Button from '@/components/Button';
import DangerousRaw from '@/components/DangerousRaw';

import * as styles from './index.module.scss';

type Props = {
  data: TenantInfo[];
};

const Tenants = ({ data }: Props) => {
  useEffect(() => {
    if (data.length <= 1) {
      if (data[0]) {
        window.location.assign('/' + data[0].id);
      } else {
        // Todo: create tenant
      }
    }
  }, [data]);

  if (data.length > 1) {
    return (
      <div className={styles.wrapper}>
        <h3>Choose a tenant</h3>
        {data.map(({ id }) => (
          <a key={id} href={'/' + id}>
            <Button title={<DangerousRaw>{id}</DangerousRaw>} />
          </a>
        ))}
      </div>
    );
  }

  return <AppLoadingOffline />;
};

export default Tenants;
