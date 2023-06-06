import { useContext } from 'react';

import CopyToClipboard from '@/components/CopyToClipboard';
import DynamicT from '@/components/DynamicT';
import Tag from '@/components/Tag';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';

import * as styles from './index.module.scss';

function DefaultDomain() {
  const { userEndpoint } = useContext(AppEndpointsContext);

  if (!userEndpoint) {
    return null;
  }

  return (
    <div className={styles.container}>
      <CopyToClipboard className={styles.domain} value={userEndpoint.host} variant="text" />
      <Tag status="success" type="state" variant="plain">
        <DynamicT forKey="domain.status.in_used" />
      </Tag>
    </div>
  );
}

export default DefaultDomain;
