import { useContext } from 'react';

import { AppDataContext } from '@/contexts/AppDataProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';

import * as styles from './index.module.scss';

function DefaultDomain() {
  const { tenantEndpoint } = useContext(AppDataContext);

  if (!tenantEndpoint) {
    return null;
  }

  return (
    <div className={styles.container}>
      <CopyToClipboard className={styles.domain} value={tenantEndpoint.host} variant="text" />
      <Tag status="success" type="state" variant="plain">
        <DynamicT forKey="domain.status.in_used" />
      </Tag>
    </div>
  );
}

export default DefaultDomain;
