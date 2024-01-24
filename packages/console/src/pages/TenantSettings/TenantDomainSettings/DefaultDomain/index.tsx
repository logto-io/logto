import { useContext } from 'react';

import { AppDataContext } from '@/contexts/AppDataProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import Spacer from '@/ds-components/Spacer';
import Tag from '@/ds-components/Tag';

import * as styles from './index.module.scss';

function DefaultDomain() {
  const { tenantEndpoint } = useContext(AppDataContext);

  if (!tenantEndpoint) {
    return null;
  }

  const { host } = tenantEndpoint;

  return (
    <div className={styles.container}>
      <div className={styles.domain}>{host}</div>
      <Tag status="success" type="state" variant="plain">
        <DynamicT forKey="domain.status.in_use" />
      </Tag>
      <Spacer />
      <CopyToClipboard value={host} variant="icon" />
    </div>
  );
}

export default DefaultDomain;
